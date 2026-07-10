import { SellerProfile } from "../models/SellerProfile.models.js"
import { Product } from "../models/Products.models.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// @desc    Create seller profile
// @route   POST /api/v1/sellers/profile
// @access  Private - Seller/Admin
const createSellerProfile = asyncHandler(async (req, res) => {
    // Step 1: Extract seller profile details from req.body
    // shopName, shopDescription, businessEmail, businessPhone,
    // city, pincode, address, logo

    const { shopName, shopDescription, businessEmail, businessPhone, city, pincode, address, logo } = req.body

    // Step 2: Validate required fields
    // shopName, businessEmail, businessPhone, city, pincode, address
    if ([shopName, businessEmail, businessPhone, city, pincode, address].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Please provide all required fields")
    }

    // Step 3: Check if logged-in user already has a seller profile
    // SellerProfile.findOne({ user: req.user._id })
    const existingProfile = await SellerProfile.findOne({ user: req.user._id })


    // Step 4: If profile already exists, throw 409 conflict error
    if(existingProfile) {
        throw new ApiErrors(409, "Seller profile already exists for this user")
    }

    // Step 5: Create seller profile
    // user should be req.user._id
    const seller = await SellerProfile.create({
        user:req.user._id,
        shopName,
        shopDescription,
        businessEmail,
        businessPhone,
        city,
        pincode,
        address,
        logo,
    })

    // Step 6: Send success response with created seller profile
    const createdProfile = await SellerProfile.findOne({ _id: seller._id })
    if(!createdProfile) {
        throw new ApiErrors(500, "Failed to create seller profile")
    }
    res
    .status(201)
    .json(
        new ApiResponse(
            201,
            createdProfile,
            "Seller profile created successfully"
        )
    )
})


// @desc    Get logged-in seller profile
// @route   GET /api/v1/sellers/me
// @access  Private - Seller/Admin
const getMySellerProfile = asyncHandler(async (req, res) => {
    // Step 1: Find seller profile using logged-in user's id
    // SellerProfile.findOne({ user: req.user._id })
    const sellerProfile = await SellerProfile.findOne({ user: req.user._id}).populate("user", "name email avatar role city pincode")

    if (!sellerProfile) {
        throw new ApiErrors(404, "Seller profile not found. Please complete your seller profile first")
    }


    // Step 4: Send success response with seller profile
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            sellerProfile,
            "Seller profile retrieved successfully"
        )
    )
})


// @desc    Update logged-in seller profile
// @route   PATCH /api/v1/sellers/profile
// @access  Private - Seller/Admin
const updateSellerProfile = asyncHandler(async (req, res) => {
    const sellerProfile = await SellerProfile.findOne({
        user: req.user._id,
    })

    if (!sellerProfile) {
        throw new ApiErrors(
            404,
            "Seller profile not found. Please create your seller profile first"
        )
    }

    const allowedFields = [
        "shopName",
        "shopDescription",
        "businessEmail",
        "businessPhone",
        "city",
        "pincode",
        "address",
        "logo",
    ]

    const updateData = {}

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field]
        }
    })

    const updatedSellerProfile = await SellerProfile.findOneAndUpdate(
        { user: req.user._id },
        {
            $set: updateData,
        },
        {
            new: true,
            runValidators: true,
        }
    ).populate("user", "name email avatar role city pincode")

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedSellerProfile,
            "Seller profile updated successfully"
        )
    )
})

// @desc    Get public seller profile by seller profile id
// @route   GET /api/v1/sellers/:sellerId
// @access  Public
const getSellerProfileById = asyncHandler(async (req, res) => {
    // Step 1: Extract sellerId from params
    const { sellerId } = req.params

    // Step 2: Find seller profile by id and populate user basic details
    const sellerProfile = await SellerProfile.findById(sellerId).populate(
        "user",
        "name avatar city pincode"
    )

    // Step 3: If seller profile not found, throw error
    if (!sellerProfile) {
        throw new ApiErrors(404, "Seller profile not found")
    }

    // Step 4: Send success response
    return res.status(200).json(
        new ApiResponse(
            200,
            sellerProfile,
            "Seller profile fetched successfully"
        )
    )
})


// @desc    Get logged-in seller dashboard stats
// @route   GET /api/v1/sellers/dashboard/stats
// @access  Private - Seller/Admin
const getSellerDashboardStats = asyncHandler(async (req, res) => {
    // Step 1: Find seller profile of logged-in user
    const sellerProfile = await SellerProfile.findOne({
        user: req.user._id,
    })

    // Step 2: If seller profile not found, throw error
    if (!sellerProfile) {
        throw new ApiErrors(
            404,
            "Seller profile not found. Please create your seller profile first"
        )
    }

    // Step 3: Run aggregation on Product collection
    const stats = await Product.aggregate([
        {
            $match: {
                seller: req.user._id,
            },
        },
        {
            $group: {
                _id: "$seller",

                totalProducts: {
                    $sum: 1,
                },

                activeProducts: {
                    $sum: {
                        $cond: [{ $eq: ["$isAvailable", true] }, 1, 0],
                    },
                },

                inactiveProducts: {
                    $sum: {
                        $cond: [{ $eq: ["$isAvailable", false] }, 1, 0],
                    },
                },

                outOfStockProducts: {
                    $sum: {
                        $cond: [{ $lte: ["$stock", 0] }, 1, 0],
                    },
                },

                totalStock: {
                    $sum: "$stock",
                },

                inventoryValue: {
                    $sum: {
                        $multiply: ["$price", "$stock"],
                    },
                },

                averageRating: {
                    $avg: "$averageRating",
                },
            },
        },
    ])

    // Step 4: Prepare fallback stats if seller has no products
    const dashboardStats = stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        outOfStockProducts: 0,
        totalStock: 0,
        inventoryValue: 0,
        averageRating: 0,
    }

    // Step 5: Send success response
    return res.status(200).json(
        new ApiResponse(
            200,
            dashboardStats,
            "Seller dashboard stats fetched successfully"
        )
    )
})

// @desc    Delete logged-in seller profile
// @route   DELETE /api/v1/sellers/profile
// @access  Private - Seller/Admin
const deleteSellerProfile = asyncHandler(async (req, res) => {
    // Step 1: Find seller profile using logged-in user's id
    const sellerProfile = await SellerProfile.findOne({
        user: req.user._id,
    })

    // Step 2: If seller profile not found, throw error
    if (!sellerProfile) {
        throw new ApiErrors(
            404,
            "Seller profile not found"
        )
    }

    // Step 3: Check if seller has products linked with this seller profile
    const productCount = await Product.countDocuments({
        seller: req.user._id,
    })

    // Step 4: If products exist, prevent deletion
    if (productCount > 0) {
        throw new ApiErrors(
            400,
            "Cannot delete seller profile while products are linked. Please delete or disable your products first."
        )
    }

    // Step 5: Delete seller profile
    await SellerProfile.findByIdAndDelete(sellerProfile._id)

    // Step 6: Send success response
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Seller profile deleted successfully"
        )
    )
})

export {
    createSellerProfile,
    getMySellerProfile,
    updateSellerProfile,
    getSellerProfileById,
    getSellerDashboardStats,
    deleteSellerProfile,
}