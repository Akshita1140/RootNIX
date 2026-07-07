import { SellerProfile } from "../models/SellerProfile.models.js"
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

// Use this ONLY on routes that require an existing, approved SellerProfile
// (e.g. creating/updating products). Do NOT use it on the seller-profile
// creation route itself — a brand-new seller won't have a profile yet.
export const requireApprovedSeller = async (req, res, next) => {
    if (req.user.role === "admin") {
        return next()
    }

    const sellerProfile = await SellerProfile.findOne({ user: req.user._id })

    if (!sellerProfile) {
        throw new ApiErrors(403, "No such Seller Found.")
    }

    if (sellerProfile.status !== "approved") {
        throw new ApiErrors(403, "You are not an Approved Seller.")
    }

    next()
}