import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { runPlantScan } from "../services/scanner.service.js"
import { ScanHistory } from "../models/ScanHistory.models.js"

// ─── POST /api/v1/scanner/scan ────────────────────────────────────────
// scanPlant — requires login; accepts a single image, returns species ID + health diagnosis
const scanPlant = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiErrors(400, "No image uploaded")
    }

    const { buffer, mimetype } = req.file

    const result = await runPlantScan(buffer, mimetype)

    // Best-effort save — a history write failing should never fail the scan itself.
    // Auto-deletes after 15 days via the TTL index on ScanHistory.
    try {
        await ScanHistory.create({
            user: req.user._id,
            identification: result.identification || undefined,
            health: result.health || undefined,
        })
    } catch (err) {
        console.error("Failed to save scan history:", err.message)
    }

    res.status(200).json(
        new ApiResponse(200, result, "Scan complete")
    )
})

// ─── GET /api/v1/scanner/history ──────────────────────────────────────
// getScanHistory — logged-in user's last 15 days of scans, most recent first
const getScanHistory = asyncHandler(async (req, res) => {
    const history = await ScanHistory.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)

    res.status(200).json(
        new ApiResponse(200, history, "Scan history fetched")
    )
})

export { scanPlant, getScanHistory }
