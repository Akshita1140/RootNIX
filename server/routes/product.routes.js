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
import { authorizeRoles, requireApprovedSeller } from "../middleware/role.middleware.js"
import { upload } from "../middleware/multer.middleware.js"

const router = Router()


//Pbulic Routes
router.route("/my-listings")
    .get(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        requireApprovedSeller,
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
        requireApprovedSeller,
        upload.array("images", 5),
        createProduct
    )

// Update product
router.route("/:productId")
    .patch(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        requireApprovedSeller,
        upload.array("images", 5),
        updateProduct
    )

// Soft delete product
router.route("/:productId")
    .delete(
        verifyJWT,
        authorizeRoles("seller", "admin"),
        requireApprovedSeller,
        deleteProduct
    )


export default router