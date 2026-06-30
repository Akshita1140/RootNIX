import { asyncHandler } from "../utils/asyncHandler.js"
import Cart from "../models/Cart.models.js"
import { Product } from "../models/Products.models.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getCart = asyncHandler(async (req, res) => {
    // 1. Find cart belonging to logged-in user
    const cart = await Cart.findOne({
        userId: req.user._id
    }).populate(
        "items.productId",
        "name price images stock isAvailable"
    )

    // 2. If user has never created a cart,
    // return empty cart instead of throwing error
    if (!cart) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    items: [],
                    totalItems: 0,
                    totalAmount: 0
                },
                "Cart is empty"
            )
        )
    }

    // 3. Return cart
    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Cart fetched successfully"
        )
    )
})

const addToCart = asyncHandler(async (req, res) => {

    const { productId, quantity = 1 } = req.body

    if (!productId) {
        throw new ApiErrors(
            400,
            "Product id is required"
        )
    }
    if (quantity <= 0) {
        throw new ApiErrors(403, "Quantity must be greater than zero")
    }

    // 3. Find product using productId
    // Product.findById(productId)
    const product = await Product.findById(productId)

    // 4. Check if product exists
    // if not found -> throw 404
    if (!product) {
        throw new ApiErrors(404, "Product Not Found.")
    }

    // 5. Check if product is available for purchase
    // product.isAvailable should be true
    const checkAvailable = product.isAvailable
    if (!checkAvailable) {
        throw new ApiErrors(400, "Product is unavailable")
    }

    // 6. Check stock availability
    // requested quantity should not exceed product.stock
    if (quantity > product.stock) {
        throw new ApiErrors(400,
            "Insufficient stock available")
    }

    // 7. Find user's cart using req.user._id
    const userCart = await Cart.findOne({
        userId: req.user._id
    })
    // Cart.findOne({ userId: req.user._id })

    // 8. If cart does not exist, create a new cart document
    // initialize with empty items array
    if (!userCart) {
        userCart = await Cart.create({
            userId: req.user._id,
            items: []
        })
    }

    // 9. Check if product already exists in cart
    // compare ObjectIds using toString()
    const existingItem = userCart.items.find(
        (item) => item.productId.toString() ===
            productId.toString()
    )

    // 10. If product already exists:
    // increase quantity instead of creating duplicate item
    if (existingItem) {
        //check the combined quantity
        const newQuantity = existingItem.quantity + quantity

        // validate combined quantity against stock
        if (newQuantity > product.stock) {
            throw new ApiErrors(
                400,
                "Requested quantity exceeds stock"
            )
        }
        existingItem.quantity = newQuantity
    } else {
        userCart.items.push({
            productId: product._id,
            sellerId: product.seller,
            quantity,
            priceAtAddition: product.price
        })
    }

    // 9. Trigger pre-save totals calculation
    await userCart.save()

    // 13. Return updated cart in response
    res.status(200).json(
        new ApiResponse(
            200,
            userCart,
            "Product added to cart successfully!"
        )
    )
})


const updateCartItem = asyncHandler(async (req, res) => {

    // 1. Extract productId and quantity from req.body
    const { productId, quantity } = req.body

    // 2. Validate required fields
    // productId is required
    // quantity should be a valid number
    if (!productId) {
        throw new ApiErrors(
            400,
            "Product id is required"
        )
    }

    // 3. Find user's cart using req.user._id
    // Cart.findOne({ userId: req.user._id })
    const cart = await Cart.findOne({
        userId: req.user._id
    })

    if (!cart) {
        throw new ApiErrors(
            404,
            "Cart not found"
        )
    }

    // 5. Find the cart item inside cart.items
    // compare ObjectIds using toString() on both sides
    const cartItem = cart.items.find(
        (item) =>
            item.productId.toString() ===
            productId.toString()
    )

    if (!cartItem) {
        throw new ApiErrors(
            404,
            "Product not found in cart"
        )
    }

    if (quantity <= 0) {
        cart.items = cart.items.filter(
            (item) =>
                item.productId.toString() !==
                productId.toString()
        )

        await cart.save()
        return res.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Item removed from cart"
            )
        )
    }
    // 6. Validate stock
    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiErrors(
            404,
            "Product not found"
        )
    }

    if (quantity > product.stock) {
        throw new ApiErrors(
            400,
            "Requested quantity exceeds stock"
        )
    }
    cartItem.quantity = quantity

    // 8. Save
    await cart.save()

    // 9. Return updated cart
    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Cart updated successfully"
        )
    )
})

const removeFromCart = asyncHandler(async (req, res) => {
    // 1. Extract param
    const { productId } = req.params

    // 2. Find cart
    const cart = await Cart.findOne({
        userId: req.user._id
    })

    if (!cart) {
        throw new ApiErrors(
            404,
            "Cart not found"
        )
    }

    // 3. Remove item
    cart.items = cart.items.filter(
        (item) =>
            item.productId.toString() !==
            productId.toString()
    )

    // 4. Save cart
    await cart.save()

    // 5. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Item removed successfully"
        )
    )
})

const clearCart = asyncHandler(async (req, res) => {
    // 1. Find cart
    const cart = await Cart.findOne({
        userId: req.user._id
    })

    if (!cart) {
        throw new ApiErrors(
            404,
            "Cart not found"
        )
    }

    // 2. Empty items array
    cart.items = []

    // 3. Save cart
    await cart.save()

    // 4. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Cart cleared successfully"
        )
    )
})