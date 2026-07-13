import User from "../models/User.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiErrors(401, "Unauthorized request")
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodeToken?.id).select("-password -refreshToken -otp -otpExpiry ")
        if (!user) {
            throw new ApiErrors(401, "Invalid Access Token")
        }
        if (user.isBanned) {
            throw new ApiErrors(403, "Your account has been banned. Contact support for details.")
        }
        req.user = user;
        next()
    } catch (error) {
        // Re-throw ApiErrors as-is so the real 401 reason (e.g. "Unauthorized request")
        // reaches the client instead of being masked by a generic message.
        if (error instanceof ApiErrors) {
            throw error
        }
        // Anything else (jwt malformed/expired, missing ACCESS_TOKEN_SECRET, DB error) —
        // log the real cause on the server so it's actually debuggable.
        console.error("verifyJWT failed:", error.name, "-", error.message)
        throw new ApiErrors(401, `Token verification failed: ${error.message}`)
    }
})

