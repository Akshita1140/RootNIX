import { Router } from 'express'
import { createOrder } from '../controllers/order.controllers.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()

// Secured route — user must be logged in to place an order
router.route('/').post(verifyJWT, createOrder)

export default router