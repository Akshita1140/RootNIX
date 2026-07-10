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

        const user = await User.findById(decodeToken?.id).select("-password -refreshToken -otp -otpExpiry -verified")
        if (!user) {
            throw new ApiErrors(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        if (error instanceof ApiErrors) {
            throw error
        }
        console.error("verifyJWT failed:", error.name, "-", error.message)
        throw new ApiErrors(401, `Token verification failed: ${error.message}`)
    }
})