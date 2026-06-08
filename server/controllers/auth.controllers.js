import { asyncHandler } from '../utils/asynchandler.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import User from '../models/User.models.js'
import { sendOtpEmail } from '../services/email.service.js'



const generateAccessTokenandRefreshToken = async (userId) => {
    const user = await User.findById(userId)
    await user.save({validateBeforeSave:false})
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    return { accessToken, refreshToken }
}

const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password, role, city, pincode, lat, lng } = req.body

    if ([name, email, password, role, city, pincode].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Please provide all required fields")
    }
    // 3. check karo user already exists toh nahi
    const existedUser = await User.findOne({ email })
    if (existedUser) {
        throw new ApiErrors(400, "User already exists with this email")
    }
    //   // 4. OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6 digit OTP

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry

    //   // 6. User.create karo
    const user = await User.create({
        name,
        email,
        password,
        role,
        city,
        pincode,
        latitude: lat,
        longitude: lng,
        otp: otp,
        otpExpiry: otpExpiry
    })

    const createdUser = await User.findById(user._id).select(
        "-password -otp -otpExpiry -refreshToken"
    )
    if (!createdUser) {
        throw new ApiErrors(500, "User creation failed")
    }

    //   // 7. OTP email send karo
    const otpEmail = await sendOtpEmail(email, otp)
    if (!otpEmail) {
        throw new ApiErrors(500, "Failed to send OTP email")
    }

    //temp console log for email sending result
    console.log("OTP email sent:", otpEmail.messageId)

    //   // 8. response return karo
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully.OTP sent to email check inbox or spam folder.")
    )

})

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body

    // validate email and otp
    if ([email, otp].some((field) => !field || String(field).trim() === "")) {
        throw new ApiErrors(400, "Please fill all required fields")
    }
    // find user by email
    const existUser = await User.findOne({ email }).select("+otp +otpExpiry")
    if (!existUser) {
        throw new ApiErrors(404, "User not found with this email")
    }
    // check already verified

    if (existUser.verified) {
        throw new ApiErrors(400, "User already verified")
    }

    //check if otp and otpexpiry exist
    if (!existUser.otp || !existUser.otpExpiry) {
        throw new ApiErrors(400, "OTP not found. Please request a new one.")
    }
    // compare OTP
    if (existUser.otp !== String(otp)) {
        throw new ApiErrors(400, "Invalid OTP")
    }
    // check expiry
    if (existUser.otpExpiry < new Date()) {
        throw new ApiErrors(400, "OTP has expired. Please request a new one.")
    }
    // update user as verified and clear OTP fields
    existUser.verified = true
    existUser.otp = undefined
    existUser.otpExpiry = undefined
    await existUser.save()

    const verifiedUser = await User.findById(existUser._id).select(
        "-password -otp -otpExpiry -refreshToken"
    )

    // send response
    return res.status(200).json(
        new ApiResponse(200, verifiedUser, "Email verified successfully. You can now log in.")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
// 1. req.body se email aur password nikalo
const {email,password} = req.body
// 2. Check karo email/password empty toh nahi
if([email,password].some((field)=>!field || String(field).trim()==="")){
    throw new ApiErrors(400,"Please provide email and password")
}
// 3. User find karo email se
const user = await User.findOne({email}).select("+password +verified")
// 4. Password field bhi select karo because schema me select:false hai
// 5. Agar user nahi mila toh error
if(!user){
    throw new ApiErrors(404,"User not found with this email")
}
// 6. Agar user verified nahi hai toh error
if(!user.verified){
    throw new ApiErrors(400,"Email not verified. Please verify your email before logging in.")
}
// 7. Password compare karo using matchPassword()
const isPasswordVerified = await user.matchPassword(password)
// 8. Agar password wrong hai toh error
if(!isPasswordVerified){
    throw new ApiErrors(400,"Invalid credentials")
}
// 9. JWT token generate karo
const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id)
// 10. Safe user fetch karo without password
const safeUser = await User.findById(user._id).select("-password -otp -otpExpiry -refreshToken")
// 11. Response bhejo: user + token
const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
}
return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json(
    new ApiResponse(200, { user: safeUser, accessToken }, "Login successful")
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

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(200, null, "Logged out successfully")
        )
})

export { registerUser, verifyOtp, loginUser, logOutUser }
