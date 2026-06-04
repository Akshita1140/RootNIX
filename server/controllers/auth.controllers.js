import { asyncHandler } from '../utils/asynchandler.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import User from '../models/User.models.js'
import { sendOtpEmail } from '../services/email.service.js'
import  {generateToken}  from '../utils/generateToken.js'

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

})


export { registerUser, verifyOtp, loginUser }


