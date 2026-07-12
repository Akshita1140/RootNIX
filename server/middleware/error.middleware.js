import { ApiErrors } from "../utils/ApiErrors.js"

// Global error handler — MUST be registered after all routes in app.js.
// Without this, Express's default handler sends raw HTML with an exposed
// stack trace to the client (even for expected 401/404s), and the frontend's
// err.response?.data?.message parsing silently breaks since data isn't JSON.
export const errorHandler = (err, req, res, next) => {
    // Known, expected app errors (thrown via `throw new ApiErrors(...)`)
    if (err instanceof ApiErrors) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: Array.isArray(err.error) ? err.error : [],
        })
    }

    // Mongoose validation errors — surface field-level messages instead of a generic 500
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: messages.join(", ") || "Validation failed",
            errors: messages,
        })
    }

    // Malformed MongoDB ObjectId (e.g. bad :id in a route param)
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: `Invalid value for ${err.path}`,
            errors: [],
        })
    }

    // Anything else is unexpected — log full details server-side, never leak
    // the stack trace or internal file paths to the client.
    console.error("Unhandled server error:", err)
    return res.status(err.statusCode || 500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
        errors: [],
    })
}
