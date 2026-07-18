import axios from "axios"
import FormData from "form-data"
import sharp from "sharp"
import { ApiErrors } from "../utils/ApiErrors.js"

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest"

/**
 * Whatever format the user uploads (webp, gif, png, jpg...), normalize it to
 * a plain JPEG buffer before sending anywhere. PlantNet only accepts
 * jpeg/png and rejects everything else with a 400 — this makes the scan
 * work regardless of what the source photo actually was (e.g. images saved
 * from Google search results are frequently WEBP despite a .jpg filename).
 */
const normalizeToJpeg = async (imageBuffer) => {
    return sharp(imageBuffer).jpeg({ quality: 85 }).toBuffer()
}

const FALLBACK_HEALTH_RESULT = {
    healthStatus: "unknown",
    issues: [],
    diagnosis: "Could not parse AI response. Try a clearer, well-lit photo.",
    careRecommendations: [],
    wateringAdvice: "",
    sunlightAdvice: "",
}

/**
 * Some vision models (notably Qwen's "thinking" mode on Groq) prepend a
 * <think>...</think> reasoning block before the actual JSON, even when
 * asked for JSON-only output. Strip that, strip markdown fences, then pull
 * out the first {...} block as a safety net against any other stray text
 * the model adds around the JSON.
 */
const extractJson = (rawText) => {
    let cleaned = rawText
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/```json|```/g, "")
        .trim()

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) cleaned = jsonMatch[0]

    try {
        return JSON.parse(cleaned)
    } catch (err) {
        return null
    }
}

/**
 * Step 1 — species identification via PlantNet.
 * Returns null (not throw) when PlantNet has no match, so the caller can
 * still fall back to the Gemini health read even without a species name.
 */
const identifyWithPlantNet = async (imageBuffer, mimetype) => {
    const form = new FormData()
    form.append("images", imageBuffer, { filename: "scan.jpg", contentType: mimetype })
    form.append("organs", "leaf")

    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`

    const { data } = await axios.post(url, form, {
        headers: form.getHeaders(),
        timeout: 15000,
    })

    if (!data.results || data.results.length === 0) return null

    const top = data.results[0]
    return {
        scientificName: top.species.scientificNameWithoutAuthor,
        commonNames: top.species.commonNames || [],
        family: top.species.family?.scientificNameWithoutAuthor || null,
        confidence: Math.round(top.score * 100),
        alternates: data.results.slice(1, 4).map((r) => ({
            scientificName: r.species.scientificNameWithoutAuthor,
            confidence: Math.round(r.score * 100),
        })),
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Step 2 — health/disease diagnosis via Gemini vision.
 * speciesContext (from step 1) is folded into the prompt when available,
 * so the diagnosis is specific to that plant rather than generic.
 * Retries on 503 (Gemini's "high demand" overload) since that's transient,
 * not a real failure — a couple of short retries usually clears it.
 */
const analyzeHealthWithGemini = async (base64Image, mimetype, speciesContext, attempt = 1) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`

    const prompt = `You are a plant health expert. ${
        speciesContext ? `The plant has been identified as ${speciesContext}.` : "Species is unknown."
    }
Look at the uploaded plant image and respond ONLY with valid JSON (no markdown, no backticks, no preamble) in exactly this shape:
{
  "healthStatus": "healthy" | "mild_issue" | "needs_attention" | "critical",
  "issues": ["short issue phrase", "..."],
  "diagnosis": "1-2 sentence explanation of what you observe in the image",
  "careRecommendations": ["tip 1", "tip 2", "tip 3"],
  "wateringAdvice": "short advice",
  "sunlightAdvice": "short advice"
}
If the plant looks healthy, "issues" should be an empty array.`

    try {
        const { data } = await axios.post(
            url,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: mimetype, data: base64Image } },
                        ],
                    },
                ],
                generationConfig: { temperature: 0.4 },
            },
            { timeout: 20000 }
        )

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
        return extractJson(rawText) || FALLBACK_HEALTH_RESULT
    } catch (err) {
        const isOverloaded = err.response?.status === 503
        if (isOverloaded && attempt < 3) {
            await sleep(attempt * 1000) // 1s, then 2s
            return analyzeHealthWithGemini(base64Image, mimetype, speciesContext, attempt + 1)
        }
        throw err
    }
}

/**
 * Fallback health check via Groq (OpenAI-compatible chat completions).
 * Used only when Gemini fails outright (after its own retries) — Groq's
 * current vision model (qwen/qwen3.6-27b) is a preview-tier model on their
 * side, so Gemini stays primary and this is just a safety net so a scan
 * doesn't come back with zero health data during a Gemini outage.
 */
const analyzeHealthWithGroq = async (base64Image, mimetype, speciesContext) => {
    const prompt = `You are a plant health expert. ${
        speciesContext ? `The plant has been identified as ${speciesContext}.` : "Species is unknown."
    }
Look at the uploaded plant image and respond ONLY with valid JSON (no markdown, no backticks, no preamble) in exactly this shape:
{
  "healthStatus": "healthy" | "mild_issue" | "needs_attention" | "critical",
  "issues": ["short issue phrase", "..."],
  "diagnosis": "1-2 sentence explanation of what you observe in the image",
  "careRecommendations": ["tip 1", "tip 2", "tip 3"],
  "wateringAdvice": "short advice",
  "sunlightAdvice": "short advice"
}
If the plant looks healthy, "issues" should be an empty array.`

    const { data } = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "qwen/qwen3.6-27b",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:${mimetype};base64,${base64Image}` } },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
        },
        {
            headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
            timeout: 20000,
        }
    )

    const rawText = data.choices?.[0]?.message?.content || "{}"
    return extractJson(rawText) || FALLBACK_HEALTH_RESULT
}

/**
 * Orchestrates both calls. Runs PlantNet first (its result feeds the
 * Gemini prompt), and treats either provider failing as non-fatal —
 * only throws if identification AND every health provider fail.
 * Image is normalized to JPEG once up front so downstream calls never
 * have to think about the original format.
 */
const runPlantScan = async (imageBuffer, mimetype) => {
    const jpegBuffer = await normalizeToJpeg(imageBuffer)
    const normalizedMimetype = "image/jpeg"
    const base64Image = jpegBuffer.toString("base64")

    let speciesData = null
    try {
        speciesData = await identifyWithPlantNet(jpegBuffer, normalizedMimetype)
    } catch (err) {
        console.error("PlantNet failed:", err.response?.data || err.message)
    }

    const contextName = speciesData
        ? speciesData.commonNames?.[0] || speciesData.scientificName
        : null

    let healthData = null
    try {
        healthData = await analyzeHealthWithGemini(base64Image, normalizedMimetype, contextName)
        healthData = { ...healthData, source: "gemini" }
    } catch (err) {
        console.error("Gemini failed:", err.response?.data || err.message)

        if (process.env.GROQ_API_KEY) {
            try {
                healthData = await analyzeHealthWithGroq(base64Image, normalizedMimetype, contextName)
                healthData = { ...healthData, source: "groq" }
            } catch (groqErr) {
                console.error("Groq fallback failed:", groqErr.response?.data || groqErr.message)
            }
        }
    }

    if (!speciesData && !healthData) {
        throw new ApiErrors(502, "Scan failed on both identification and health checks. Try a clearer photo.")
    }

    return { identification: speciesData, health: healthData }
}

export { runPlantScan }
