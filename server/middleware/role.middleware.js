import { ApiErrors } from "../utils/ApiErrors.js"

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiErrors(401, "Authentication required")
        }

        if (!allowedRoles.length) {
            throw new ApiErrors(500, "No roles configured for this route")
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiErrors(
                403,
                `Access denied. Required role: ${allowedRoles.join(" or ")}`
            )
        }

        next()
    }
}