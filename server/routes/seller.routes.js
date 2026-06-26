import { Router } from "express"

import {
    createSellerProfile,
    getMySellerProfile,
    updateSellerProfile,
    getSellerProfileById,
    getSellerDashboardStats,
    deleteSellerProfile,
} from "../controllers/seller.controllers.js"

import { verifyJWT } from "../middleware/auth.middleware.js"
import { authorizeRoles } from "../middleware/role.middleware.js"

const router = Router()

router
    .route("/profile")
    .post(verifyJWT, authorizeRoles("seller", "admin"), createSellerProfile)
    .patch(verifyJWT, authorizeRoles("seller", "admin"), updateSellerProfile)
    .delete(verifyJWT, authorizeRoles("seller", "admin"), deleteSellerProfile)

router
    .route("/me")
    .get(verifyJWT, authorizeRoles("seller", "admin"), getMySellerProfile)

router
    .route("/dashboard/stats")
    .get(verifyJWT, authorizeRoles("seller", "admin"), getSellerDashboardStats)

// public route — always keep dynamic route at the end
router
    .route("/:sellerId")
    .get(getSellerProfileById)

export default router