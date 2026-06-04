import nodemailer from "nodemailer"
import { ApiErrors } from "../utils/ApiErrors.js"

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOtpEmail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Rootnix Email Verification OTP",
            html: `
                <h2>Welcome to Rootnix 🌱</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
            `
        })
        return info
    } catch (error) {
        throw new ApiErrors(500, "Failed to send OTP email")
    }
}

export { sendOtpEmail }