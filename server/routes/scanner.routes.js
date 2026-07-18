import { Router } from "express"
import { scanPlant, getScanHistory } from "../controllers/scanner.controllers.js"
import { scanUpload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { scanBurstLimiter, scanDailyLimiter } from "../middleware/rateLimiter.middleware.js"

const router = Router()

// Login required — scanning ties into a logged-in user's experience.
// Rate limited to protect the shared PlantNet/Gemini/Groq free-tier quotas:
// scanDailyLimiter caps total app-wide scans/day, scanBurstLimiter stops
// any one user from rapid-firing the endpoint.
router.route("/scan")
    .post(verifyJWT, scanDailyLimiter, scanBurstLimiter, scanUpload.single("image"), scanPlant)

// Last 15 days of the logged-in user's scans (older ones auto-delete via TTL)
router.route("/history")
    .get(verifyJWT, getScanHistory)

export default router
