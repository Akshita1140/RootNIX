import jwt from "jsonwebtoken"
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import User from '../models/User.models.js'
import { PendingRegistration } from '../models/PendingRegistration.models.js'
import { sendOtpEmail } from '../services/email.service.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const generateAccessTokenandRefreshToken = async (userId) => {
    const user = await User.findById(userId)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken

    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
}

// Shared refreshToken cookie options.
// sameSite must be "none" (with secure:true) when frontend and backend
// are on different origins in production (e.g. Vercel + Render) — "strict"
// silently blocks the cookie on cross-site requests and breaks refresh/login-persistence.
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
})

const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password, role, city, pincode, lat, lng } = req.body

    if ([name, email, password, role, city, pincode].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Please provide all required fields")
    }
    // 2b. Public registration can only create buyer/seller accounts.
    // Admin accounts are never self-registered — this blocks someone from
    // bypassing the UI (e.g. via Postman) and POSTing role: "admin" directly.
    if (!["user", "seller"].includes(role)) {
        throw new ApiErrors(403, "Invalid role for self-registration")
    }
    // 3. Block only if a REAL, already-verified account exists with this email.
    const existedUser = await User.findOne({ email })
    if (existedUser) {
        throw new ApiErrors(400, "User already exists with this email")
    }
    //   // 4. OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6 digit OTP

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry

    // 6. Nothing is written to the real Users collection yet — it only holds
    // verified accounts. Upsert into PendingRegistration instead: if this
    // email already has an abandoned/unverified attempt sitting here, this
    // overwrites it with a fresh OTP instead of blocking the person from
    // ever completing registration.
    await PendingRegistration.findOneAndUpdate(
        { email },
        {
            name,
            email,
            password,
            role,
            city,
            pincode,
            latitude: lat,
            longitude: lng,
            otp,
            otpExpiry,
            createdAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    //   // 7. OTP email send karo
    const otpEmail = await sendOtpEmail(email, otp)
    if (!otpEmail) {
        throw new ApiErrors(500, "Failed to send OTP email")
    }


    //   // 8. response return karo
    return res.status(201).json(
        new ApiResponse(201, { name, email }, "OTP sent to email. Please verify to complete registration.")
    )

})

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body

    // validate email and otp
    if ([email, otp].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Please fill all required fields")
    }

    // Already a real, verified account? Nothing left to verify.
    const alreadyVerifiedUser = await User.findOne({ email })
    if (alreadyVerifiedUser) {
        throw new ApiErrors(400, "User already verified")
    }

    // Find the pending registration attempt for this email
    const pending = await PendingRegistration.findOne({ email })
    if (!pending) {
        throw new ApiErrors(404, "No pending registration found for this email. Please register again.")
    }

    // compare OTP
    if (pending.otp !== String(otp)) {
        throw new ApiErrors(400, "Invalid OTP")
    }
    // check expiry
    if (pending.otpExpiry < new Date()) {
        throw new ApiErrors(400, "OTP has expired. Please register again to get a new one.")
    }

    // OTP is correct — NOW (and only now) do we create the real account.
    // pending.password is plain text; User's pre-save hook hashes it once here.
    const newUser = await User.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        city: pending.city,
        pincode: pending.pincode,
        latitude: pending.latitude,
        longitude: pending.longitude,
        verified: true,
    })

    await PendingRegistration.deleteOne({ email })

    const verifiedUser = await User.findById(newUser._id).select(
        "-password -otp -otpExpiry -refreshToken"
    )

    // send response
    return res.status(200).json(
        new ApiResponse(200, verifiedUser, "Email verified successfully. You can now log in.")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // 1. req.body se email aur password nikalo
    const { email, password } = req.body
    // 2. Check karo email/password empty toh nahi
    if ([email, password].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Please provide email and password")
    }
    // 3. User find karo email se
    const user = await User.findOne({ email }).select("+password +verified")
    // 4. Password field bhi select karo because schema me select:false hai
    // 5. Agar user nahi mila toh error
    if (!user) {
        throw new ApiErrors(404, "User not found with this email")
    }
    // 6. Agar user verified nahi hai toh error
    if (!user.verified) {
        throw new ApiErrors(400, "Email not verified. Please verify your email before logging in.")
    }
    // 6b. Agar user banned hai toh login block karo
    if (user.isBanned) {
        throw new ApiErrors(403, "Your account has been banned. Contact support for details.")
    }
    // 7. Password compare karo using matchPassword()
    const isPasswordVerified = await user.matchPassword(password)
    // 8. Agar password wrong hai toh error
    if (!isPasswordVerified) {
        throw new ApiErrors(400, "Invalid credentials")
    }
    // 9. JWT token generate karo
    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id)
    // 10. Safe user fetch karo without password
    const safeUser = await User.findById(user._id).select("-password -otp -otpExpiry -refreshToken")
    // 11. Response bhejo: user + token
    const options = cookieOptions()
    return res.status(200).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, { user: safeUser, accessToken }, "Login successful")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiErrors(401, "Refresh token not found. Please log in again.")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?.id).select("+refreshToken")

    if (!user) {
        throw new ApiErrors(401, "User not found. Invalid refresh token.")
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiErrors(401, "Refresh token mismatch. Please log in again.")
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenandRefreshToken(user._id)

    const options = cookieOptions()

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Access token refreshed successfully"
            )
        )
})

const logOutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    user.refreshToken = null
    await user.save({ validateBeforeSave: false })

    const options = cookieOptions()

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, null, "Logged out successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email || String(email).trim() === "") {
        throw new ApiErrors(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiErrors(404, "User not found with this email")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry

    await user.save({ validateBeforeSave: false })

    const otpEmail = await sendOtpEmail(email, otp)

    if (!otpEmail) {
        throw new ApiErrors(500, "Failed to send password reset OTP")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset OTP sent to your email."
        )
    )
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body

    if ([email, otp, newPassword].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Email, OTP and new password are required")
    }

    const user = await User.findOne({ email }).select("+otp +otpExpiry +password")

    if (!user) {
        throw new ApiErrors(404, "User not found with this email")
    }

    if (!user.otp || !user.otpExpiry) {
        throw new ApiErrors(400, "OTP not found. Please request a new one.")
    }

    if (user.otp !== String(otp)) {
        throw new ApiErrors(400, "Invalid OTP")
    }

    if (user.otpExpiry < new Date()) {
        throw new ApiErrors(400, "OTP has expired. Please request a new one.")
    }

    user.password = newPassword
    user.otp = undefined
    user.otpExpiry = undefined
    user.refreshToken = null

    await user.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset successfully. You can now log in with your new password."
        )
    )
})

const updateProfile = asyncHandler(async (req, res) => {
    const { name, city, pincode, lat, lng } = req.body

    const updates = {}
    if (name !== undefined && String(name).trim() !== "") updates.name = name
    if (city !== undefined && String(city).trim() !== "") updates.city = city
    if (pincode !== undefined && String(pincode).trim() !== "") updates.pincode = pincode
    if (lat !== undefined && lat !== "") updates.latitude = lat
    if (lng !== undefined && lng !== "") updates.longitude = lng

    if (Object.keys(updates).length === 0) {
        throw new ApiErrors(400, "No valid fields provided to update")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry -refreshToken")

    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    )
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar file is required")
    }

    const avatarUrl = await uploadOnCloudinary(avatarLocalPath)

    if (!avatarUrl) {
        throw new ApiErrors(500, "Failed to upload avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatarUrl
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken -otp -otpExpiry")

    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        )
    )
})

// Resend OTP for forgot-password flow (existing, already-verified User accounts)
const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email || String(email).trim() === "") {
        throw new ApiErrors(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiErrors(404, "User not found with this email")
    }

    if (user.verified) {
        throw new ApiErrors(400, "Email is already verified")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry

    await user.save({ validateBeforeSave: false })

    const otpEmail = await sendOtpEmail(email, otp)

    if (!otpEmail) {
        throw new ApiErrors(500, "Failed to send OTP email")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "New OTP sent successfully"
        )
    )
})

// Resend OTP for registration verification (operates on PendingRegistration —
// separate from resendOtp above, which is for the forgot-password flow and
// operates on real User accounts).
const resendRegistrationOtp = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email || String(email).trim() === "") {
        throw new ApiErrors(400, "Email is required")
    }

    const alreadyVerifiedUser = await User.findOne({ email })
    if (alreadyVerifiedUser) {
        throw new ApiErrors(400, "Email is already verified")
    }

    const pending = await PendingRegistration.findOne({ email })
    if (!pending) {
        throw new ApiErrors(404, "No pending registration found for this email. Please register again.")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    pending.otp = otp
    pending.otpExpiry = otpExpiry
    // Reset the TTL clock too, so a resend also buys them another 15 minutes.
    pending.createdAt = new Date()

    await pending.save()

    const otpEmail = await sendOtpEmail(email, otp)

    if (!otpEmail) {
        throw new ApiErrors(500, "Failed to send OTP email")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "New OTP sent successfully"
        )
    )
})

export {
    registerUser,
    verifyOtp,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateAvatar,
    resendOtp,
    resendRegistrationOtp
}
