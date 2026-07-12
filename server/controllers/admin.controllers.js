import User from "../models/User.models.js"
import { SellerProfile } from "../models/SellerProfile.models.js"
import { Product } from "../models/Products.models.js"
import Order from "../models/order.models.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// @desc    Platform-wide overview stats
// @route   GET /api/v1/admin/stats
// @access  Private - Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalBuyers,
        totalSellers,
        totalAdmins,
        pendingSellers,
        totalProducts,
        activeProducts,
        totalOrders,
        revenueAgg,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "seller" }),
        User.countDocuments({ role: "admin" }),
        SellerProfile.countDocuments({ status: "pending" }),
        Product.countDocuments(),
        Product.countDocuments({ isAvailable: true }),
        Order.countDocuments(),
        Order.aggregate([
            { $match: { "paymentInfo.status": "paid" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
    ])

    const totalRevenue = revenueAgg[0]?.total || 0

    return res.status(200).json(
        new ApiResponse(200, {
            totalUsers,
            totalBuyers,
            totalSellers,
            totalAdmins,
            pendingSellers,
            totalProducts,
            activeProducts,
            totalOrders,
            totalRevenue,
        }, "Dashboard stats fetched successfully")
    )
})

// @desc    List all users (paginated, filterable by role + search)
// @route   GET /api/v1/admin/users?role=&search=&page=&limit=
// @access  Private - Admin
const getAllUsersAdmin = asyncHandler(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query

    const filter = {}
    if (role) filter.role = role
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ]
    }

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password -otp -otpExpiry -refreshToken")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        User.countDocuments(filter),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Users fetched successfully")
    )
})

// @desc    Ban or unban a user
// @route   PATCH /api/v1/admin/users/:userId/ban
// @access  Private - Admin
const toggleUserBan = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const targetUser = await User.findById(userId)
    if (!targetUser) {
        throw new ApiErrors(404, "User not found")
    }

    if (targetUser.role === "admin") {
        throw new ApiErrors(403, "Admins cannot ban other admins")
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
        throw new ApiErrors(403, "You cannot ban yourself")
    }

    targetUser.isBanned = !targetUser.isBanned
    await targetUser.save({ validateBeforeSave: false })

    const safeUser = await User.findById(targetUser._id).select("-password -otp -otpExpiry -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, safeUser, targetUser.isBanned ? "User banned successfully" : "User unbanned successfully")
    )
})

// @desc    List all seller profiles (filterable by status)
// @route   GET /api/v1/admin/sellers?status=&page=&limit=
// @access  Private - Admin
const getAllSellersAdmin = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query

    const filter = {}
    if (status) filter.status = status

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))

    const [sellers, total] = await Promise.all([
        SellerProfile.find(filter)
            .populate("user", "name email isBanned createdAt")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        SellerProfile.countDocuments(filter),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            sellers,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Sellers fetched successfully")
    )
})

// @desc    Approve / reject / suspend a seller
// @route   PATCH /api/v1/admin/sellers/:sellerId/status
// @access  Private - Admin
const updateSellerStatus = asyncHandler(async (req, res) => {
    const { sellerId } = req.params
    const { status } = req.body

    const allowedStatuses = ["pending", "approved", "rejected", "suspended"]
    if (!allowedStatuses.includes(status)) {
        throw new ApiErrors(400, `Status must be one of: ${allowedStatuses.join(", ")}`)
    }

    const sellerProfile = await SellerProfile.findById(sellerId)
    if (!sellerProfile) {
        throw new ApiErrors(404, "Seller profile not found")
    }

    sellerProfile.status = status
    sellerProfile.isVerifiedSeller = status === "approved"
    await sellerProfile.save()

    return res.status(200).json(
        new ApiResponse(200, sellerProfile, `Seller ${status} successfully`)
    )
})

// @desc    List all products across all sellers, including hidden/out-of-stock ones
// @route   GET /api/v1/admin/products?category=&availability=&search=&page=&limit=
// @access  Private - Admin
const getAllProductsAdmin = asyncHandler(async (req, res) => {
    const { category, availability, search, page = 1, limit = 20 } = req.query

    const filter = {}
    if (category) filter.category = category
    if (availability === "active") filter.isAvailable = true
    if (availability === "hidden") filter.isAvailable = false
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ]
    }

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate("seller", "name email")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Product.countDocuments(filter),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Products fetched successfully")
    )
})

// @desc    List all orders across the platform
// @route   GET /api/v1/admin/orders?status=&page=&limit=
// @access  Private - Admin
const getAllOrdersAdmin = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query

    const filter = {}
    if (status) filter.orderStatus = status

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Order.countDocuments(filter),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Orders fetched successfully")
    )
})

export {
    getDashboardStats,
    getAllUsersAdmin,
    toggleUserBan,
    getAllSellersAdmin,
    updateSellerStatus,
    getAllProductsAdmin,
    getAllOrdersAdmin,
}
