import { Resend } from "resend"
import { ApiErrors } from "../utils/ApiErrors.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const sendOtpEmail = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM, // e.g. 'RootNIX <noreply@rootnix.co.in>'
            to: email,
            subject: "Rootnix Email Verification OTP",
            html: `
                <h2>Welcome to Rootnix 🌱</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
            `
        })

        if (error) {
            console.error("Resend error:", error)
            throw new ApiErrors(500, "Failed to send OTP email")
        }

        return data
    } catch (error) {
        throw new ApiErrors(500, "Failed to send OTP email")
    }
}

export { sendOtpEmail }