
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, cloudinary } from "../utils/cloudinary.js"
import { Product } from "../models/Products.models.js"
// ─── GET /api/v1/products ───────────────────────────────────────────
// getAllProducts
const getAllProducts = asyncHandler(async (req, res) => {
    //
    // 1. READ query params from req.query:
    //    - search   → string (match against name, description using regex or $text index)
    //    - category → one of the enum values in productSchema (Indoor Plants, Seeds, etc.)
    //    - minPrice → number
    //    - maxPrice → number
    //    - careLevel → Easy | Medium | Hard
    //    - sortBy   → "price_asc" | "price_desc" | "newest" | "rating"
    //    - page     → number (default 1)
    //    - limit    → number (default 12)
    const {
        search,
        category,
        minPrice,
        maxPrice,
        careLevel,
        sortBy,
        page = 1,
        limit = 12
    } = req.query
    //
    // 2. BUILD a filter object:
    //    - only add a field to the filter if that query param actually exists
    const filter = {
        isAvailable: true,
        stock: { $gt: 0 }
    }
    //    - isAvailable: true always (never show unavailable products to buyers)
    //    - stock: { $gt: 0 } always (don't show out of stock)
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    // 3. BUILD a sort object based on sortBy:
    const sortOptions = {
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        newest: { createdAt: -1 },
        rating: { averageRating: -1 },
    };
    const sort = sortOptions[sortBy] || { createdAt: -1 };
    //    - price_asc  → { price: 1 }
    //    - price_desc → { price: -1 }
    //    - newest     → { createdAt: -1 }
    //    - rating     → { averageRating: -1 }
    //    - default    → { createdAt: -1 }
    //
    // 4. CALCULATE skip for pagination:
    //    - skip = (page - 1) * limit
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    //
    // 5. QUERY the database:
    const [products, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limitNum)
            .populate("seller", "fullName avatar"),
        Product.countDocuments(filter),
    ]);
    //    - Product.find(filter)
    //    - .sort(sort)
    //    - .skip(skip)
    //    - .limit(limit)
    //    - .populate("seller", "fullName avatar") → only send name and avatar of seller
    //
    // 6. COUNT total matching documents for pagination metadata:
    //    - Product.countDocuments(filter)
    //
    // 7. SEND response:
    res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            },
            "All Products Found."
        )
    )
})


// ─── GET /api/v1/products/:id ───────────────────────────────────────
// getProductById
const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params

    //
    // 2. FIND product:
    //    - Product.findById(productId)
    const product = await Product.findById(productId).populate("seller", "fullName avatar email")
    //    - .populate("seller", "fullName avatar email") → buyer needs seller contact info
    //
    // 3. IF product not found → throw 404 error
    if (!product) {
        throw new ApiErrors(404, "Product Not found")
    }
    //
    // 4. IF product.isAvailable is false → throw 404 (treat as not found for buyers)
    if (product.isAvailable === false) {
        throw new ApiErrors(404, "Product not Available")
    }
    //
    // 5. SEND full product object in response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                product,
                "Product Found succesfully"
            )
        )
})

// ─── POST /api/v1/products ──────────────────────────────────────────
// createProduct
// middleware needed: verifyJWT, authorizeRoles("seller", "admin"), upload.array("images", 5)
const createProduct = asyncHandler(async (req, res) => {
    const { name,
        description,
        price,
        category,
        stock, careLevel,
        lightRequirement,
        wateringFrequency,
        soilType } = req.body

    if (!name || !description || !price || !category || !stock) {
        throw new ApiErrors(401, "All fields are required.")
    }
    if (!req.files || req.files.length === 0) {
        throw new ApiErrors(400, "Atleast 1 image is needed.")
    }

    //sequential upload
    const images = []
    for (const file of req.files) {
        const uploads = await uploadOnCloudinary(file.path)

        if (!uploads) {
            throw new ApiErrors(500, `Failed to upload image: ${file.originalname}`)
        }
        images.push({
            url: uploads,
            publicId: uploads.public_id
        })
    }

    const createdProduct = await Product.create({
        name,
        description,
        price,
        category,
        stock, careLevel,
        lightRequirement,
        wateringFrequency,
        soilType,
        seller: req.user?._id,
        images
    })
    if (!createdProduct) {
        throw new ApiErrors(404, "Error in creating a product")
    }

    const product = await Product.findById(createdProduct._id)
    if (!product) {
        throw new ApiErrors(404, "Something went wrong")
    }

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully.")
    )

})

// ─── PUT /api/v1/products/:id ───────────────────────────────────────
// updateProduct
// middleware needed: verifyJWT, upload.array("images", 5) (optional new images)
const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!productId) {
        throw new ApiErrors(404, "Product not found")
    }
    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiErrors(404, "Product not found")
    }

    const isSeller = product.seller.toString() === req.user._id.toString()
    const isAdmin = req.user.role === "admin"
    if (!isSeller && !isAdmin) {
        throw new ApiErrors(403, "Not your listing.")
    }

    const { name,
        description,
        price,
        category,
        stock,
        careLevel,
        lightRequirement,
        wateringFrequency,
        soilType,
        isAvailable
    } = req.body

    if (name !== undefined) product.name = name
    if (description !== undefined) product.description = description
    if (price !== undefined) product.price = price
    if (category !== undefined) product.category = category
    if (stock !== undefined) product.stock = stock
    if (careLevel !== undefined) product.careLevel = careLevel
    if (lightRequirement !== undefined) product.lightRequirement = lightRequirement
    if (wateringFrequency !== undefined) product.wateringFrequency = wateringFrequency
    if (soilType !== undefined) product.soilType = soilType
    if (isAvailable !== undefined) product.isAvailable = isAvailable === "true" || isAvailable === true

    if (req.files && req.files.length > 0) {

        //delete the old
        for (const file of product.images) {
            if (file.publicId) {
                await cloudinary.uploader.destroy(file.publicId)
            }
        }

        const newimages = []
        for (const file of req.files) {
            const uploads = await uploadOnCloudinary(file.path)

            if (!uploads) {
                throw new ApiErrors(500, `Failed to upload image: ${file.originalname}`)
            }
            newimages.push({
                url: uploads.url,
                publicId: uploads.public_id
            })
        }
        product.images = newimages
    }

    await product.save()

    const updatedProduct = await Product.findById(product._id)
        .populate("seller", "fullName avatar email")

    if (!updatedProduct) {
        throw new ApiErrors(500, "Something went wrong while updating product")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    )


})




// ─── DELETE /api/v1/products/:id ────────────────────────────────────
// deleteProduct
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    //
    // 2. FIND product → if not found throw 404
    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiErrors(404, "Product not Found.")
    }
    //
    // 3. CHECK ownership:
    const isSeller = product.seller.toString() === req.user._id.toString()
    const isAdmin = req.user.role === "admin"
    if (!isSeller && !isAdmin) { throw new ApiErrors(403, "You cannot perform this action.") }


    //
    // 4. SOFT DELETE — do not remove from database:
    product.isAvailable = false
    await product.save()


    res.status(200)
        .json(
            new ApiResponse(
                200,
                product,
                "Product saved as unavailable"
            )
        )
})

// ─── GET /api/v1/products/seller/:sellerId ──────────────────────────
// getProductsBySeller
const getProductsBySeller = asyncHandler(async (req, res) => {
    // 1. READ sellerId from req.params.sellerId
    const { sellerId } = req.params
    //
    // 2. FIND all products where:
    //    - seller === sellerId
    const products = await Product.find({
        seller: sellerId
    }).sort({
        createdAt: -1
    })
    //    - do NOT filter by isAvailable here → seller should see their own delisted products too
    if (!products) {
        throw new ApiErrors(403, "No Products Found.")
    }

    //
    // 4. SEND products array in response
    res.status(200).json(
        new ApiResponse(
            200,
            products,
            "All the Produts are listed  successfully"
        )
    )
})

// ─── GET /api/v1/products/my-listings ───────────────────────────────
// getMyListings
// middleware needed: verifyJWT, authorizeRoles("seller", "admin")
const getMyListings = asyncHandler(async (req, res) => {
    // 1. USE req.user._id as the sellerId (no param needed, comes from JWT)
    const { _id:sellerId } = req.user
    //
    // 2. FIND all products where seller === req.user._id
    const myListings = await Product.find({
        seller: sellerId
    }).sort({
        createdAt: -1
    }
    )
    if (!myListings) {
        throw new ApiErrors(403, "No Listings Found.")
    }
    res.status(200).json(
        new ApiResponse(
            200,
            myListings,
            "All Listings are displayed"
        )
    )
    //    - this powers the "My Listings" page on the seller dashboard
})

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyListings,
    getProductsBySeller

}