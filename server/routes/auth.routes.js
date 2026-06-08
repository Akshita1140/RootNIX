import { Router } from 'express'
import {
    registerUser,
    verifyOtp,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    updateAvatar
} from '../controllers/auth.controllers.js'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { upload } from "../middleware/multer.middleware.js"
import { USER_ROLES } from "../constants/roles.js"

const router = Router()

router.route('/register').post(registerUser)
router.route('/verify-otp').post(verifyOtp)
router.route('/login').post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password').post(resetPassword)

//Secured route 
router.route('/logout').post(verifyJWT, logOutUser)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.patch(
    "/avatar",
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
)
router.post(
    "/products",
    verifyJWT,
    authorizeRoles("seller", "admin"),
    createProduct
)
router.post(
    "/products",
    verifyJWT,
    authorizeRoles(USER_ROLES.SELLER, USER_ROLES.ADMIN),
    createProduct
)

export default router