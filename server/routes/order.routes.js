import { Router } from 'express'
import { createOrder, getMyOrders } from '../controllers/order.controllers.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()

// Secured route — user must be logged in to place an order
router.route('/').post(verifyJWT, createOrder)

// Secured route — logged-in user's own order history
router.route('/my-orders').get(verifyJWT, getMyOrders)

export default router