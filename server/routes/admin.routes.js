import { Router } from "express"
import {
    getDashboardStats,
    getAllUsersAdmin,
    toggleUserBan,
    getAllSellersAdmin,
    updateSellerStatus,
    getAllProductsAdmin,
    getAllOrdersAdmin,
} from "../controllers/admin.controllers.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { authorizeRoles } from "../middleware/role.middleware.js"

const router = Router()

// Every route below requires a logged-in admin
router.use(verifyJWT, authorizeRoles("admin"))

router.route("/stats").get(getDashboardStats)

router.route("/users").get(getAllUsersAdmin)
router.route("/users/:userId/ban").patch(toggleUserBan)

router.route("/sellers").get(getAllSellersAdmin)
router.route("/sellers/:sellerId/status").patch(updateSellerStatus)

router.route("/products").get(getAllProductsAdmin)

router.route("/orders").get(getAllOrdersAdmin)

export default router
