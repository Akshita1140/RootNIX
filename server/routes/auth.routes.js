import {Router} from 'express'
import {registerUser,verifyOtp,loginUser,logOutUser} from '../controllers/auth.controllers.js'
import { verifyJWT } from '../middleware/auth.middleware.js'
const router = Router()

router.route('/register').post(registerUser)
router.route('/verify-otp').post(verifyOtp)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logOutUser)

export default router