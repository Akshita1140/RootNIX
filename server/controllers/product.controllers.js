// // name,
//         description,
//         price,
//         category,
//         stock,
//         images,
//         seller,
//         careLevel,
//         lightRequirement,
//         wateringFrequency,
//         soilType,

import { Product } from "../models/Product.models.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private - Seller/Admin
const createProduct = asyncHandler(async (req, res) => {
    // Step 1: Extract product details from req.body
    // name, description, price, category, stock, images,
    // careLevel, lightRequirement, wateringFrequency, soilType
    const { name,
        description,
        price,
        category,
        stock,
        images,
        seller,
        careLevel,
        lightRequirement,
        wateringFrequency,
        soilType, } = req.body

    // Step 2: Validate required fields
    if(!name || !description || !price || !category) {
        throw new ApiError(400, "Name, description, price, and category are required")
    }
    // name, description, price, category must be presenty

    // Step 3: Create product

    
    
    // seller should be req.user._id

    // Step 4: Send success response with created product
})

// @desc    Get all available products
// @route   GET /api/v1/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
    // Step 1: Extract query params from req.query
    // search, category, minPrice, maxPrice, sort, page, limit

    // Step 2: Create query object
    // default query should fetch only available products

    // Step 3: If search exists, apply regex search on name, description, category

    // Step 4: If category exists, filter by category

    // Step 5: If minPrice/maxPrice exists, apply price range filter

    // Step 6: Create sort option
    // newest, oldest, price-low, price-high

    // Step 7: Calculate pagination skip value

    // Step 8: Fetch products from DB
    // populate seller basic details
    // sort, skip, limit

    // Step 9: Count total products for pagination

    // Step 10: Send response with products and pagination data
})

// @desc    Get single product by id
// @route   GET /api/v1/products/:productId
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    // Step 1: Extract productId from req.params

    // Step 2: Find product by id

    // Step 3: Populate seller basic details

    // Step 4: If product not found, throw 404 error

    // Step 5: Send success response with product
})

// @desc    Get logged-in seller's products
// @route   GET /api/v1/products/seller/my-products
// @access  Private - Seller/Admin
const getMyProducts = asyncHandler(async (req, res) => {
    // Step 1: Get seller id from req.user._id

    // Step 2: Find all products where seller is req.user._id

    // Step 3: Sort products by newest first

    // Step 4: Send success response with products
})

// @desc    Update product
// @route   PATCH /api/v1/products/:productId
// @access  Private - Seller/Admin
const updateProduct = asyncHandler(async (req, res) => {
    // Step 1: Extract productId from req.params

    // Step 2: Find product by id

    // Step 3: If product not found, throw 404 error

    // Step 4: Check ownership
    // Only product seller or admin can update

    // Step 5: Update product using req.body

    // Step 6: Send success response with updated product
})

// @desc    Delete product
// @route   DELETE /api/v1/products/:productId
// @access  Private - Seller/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    // Step 1: Extract productId from req.params

    // Step 2: Find product by id

    // Step 3: If product not found, throw 404 error

    // Step 4: Check ownership
    // Only product seller or admin can delete

    // Step 5: Delete product

    // Step 6: Send success response
})

export {
    createProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct,
}