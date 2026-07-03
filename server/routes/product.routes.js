import { Router } from "express"
import {
    getAllProducts,
    getProductsBySeller,
    getMyListings,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controllers.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { authorizeRoles } from "../middleware/role.middleware.js"

const router = Router()


//Pbulic Routes
router.route("/my-listings")
    .get(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        getMyListings
    )

router.route("/").get(getAllProducts)
// Product detail page
router.route("/:productId")
    .get(getProductById)

// Seller public storefront
router.route("/seller/:sellerId")
    .get(getProductsBySeller)

// Create product
router.route("/")
    .post(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        createProduct
    )

// Update product
router.route("/:productId")
    .patch(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        updateProduct
    )

// Soft delete product
router.route("/:productId")
    .delete(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        deleteProduct
    )


export default router