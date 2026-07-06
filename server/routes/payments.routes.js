import { Router } from 'express'
import { createRazorpayOrder } from '../controllers/payments.controllers.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()

// Secured route — user must be logged in to create a Razorpay order
router.route('/create-order').post(verifyJWT, createRazorpayOrder)

export default router