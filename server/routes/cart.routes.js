import { Router } from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cart.controllers.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()

router.route('/').get(verifyJWT, getCart)
router.route('/add').post(verifyJWT, addToCart)
router.route('/update').patch(verifyJWT, updateCartItem)
router.route('/remove/:productId').delete(verifyJWT, removeFromCart)
router.route('/clear').delete(verifyJWT, clearCart)

export default router