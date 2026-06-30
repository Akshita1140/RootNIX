import { SellerProfile } from "../models/SellerProfile.models.js"
import { ApiErrors } from "../utils/ApiErrors.js"

export const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
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
        if(req.user.role === "seller"){
            const checkSeller = await SellerProfile.findOne({
                user : req.user._id
            })
            if(!checkSeller){
                throw new ApiErrors(403,"No such Seller Found.")
            }
            else{
                const checkStatus = checkSeller.status === "approved"
                if(!checkStatus){
                    throw new ApiErrors(403,"You are not a Approved Seller.")
                }
            }
        
        }

        next()
    }
}