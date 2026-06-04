import {Router} from 'express'
import {registerUser,verifyOtp} from '../controllers/auth.controllers.js'
const router = Router()

router.route('/register').post(registerUser)
router.route('/verify-otp').post(verifyOtp)

export default router