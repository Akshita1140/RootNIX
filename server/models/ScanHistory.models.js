import mongoose from "mongoose"

// Each scan is a snapshot of what PlantNet/Gemini returned at scan time —
// not linked live to a Product, since the user might scan a plant they
// don't own or that isn't listed. The TTL index below auto-deletes each
// record 15 days after it was created, so history never grows unbounded.
const scanHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    identification: {
        scientificName: String,
        commonNames: [String],
        family: String,
        confidence: Number,
    },

    health: {
        healthStatus: {
            type: String,
            enum: ["healthy", "mild_issue", "needs_attention", "critical", "unknown"],
        },
        issues: [String],
        diagnosis: String,
        careRecommendations: [String],
        wateringAdvice: String,
        sunlightAdvice: String,
        source: {
            type: String,
            enum: ["gemini", "groq"],
        },
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 15, // TTL: MongoDB auto-deletes this doc 15 days after createdAt
    },
})

export const ScanHistory = mongoose.model("ScanHistory", scanHistorySchema)
