import rateLimit, { ipKeyGenerator } from "express-rate-limit"

// Per-user burst limiter — stops one user from rapid-fire spamming the
// scan button (accidental double-clicks, retry loops during testing, etc).
export const scanBurstLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many scans in a short time — wait a few minutes and try again.",
    },
})

// App-wide daily limiter. PLANTNET_API_KEY is one shared key for the whole
// app (not per-user), and PlantNet's free tier caps at 500 requests/day —
// this keeps total scans across ALL users safely under that shared quota,
// regardless of how many people are using the scanner.
export const scanDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 400, // buffer under PlantNet's 500/day shared limit
    keyGenerator: () => "global-scan-quota",
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "The app has hit its daily scan limit — please try again tomorrow.",
    },
})
