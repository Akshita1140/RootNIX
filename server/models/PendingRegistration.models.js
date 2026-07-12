import mongoose from "mongoose"

// Holds a registration attempt until the OTP is verified.
// Nothing here ever becomes a real account on its own — verifyOtp is the
// only place that promotes a pending record into an actual User document.
// The TTL index below auto-deletes abandoned (never-verified) attempts
// after 15 minutes, so an email never gets permanently "stuck".
const pendingRegistrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Stored as plain text intentionally, short-lived only (max 15 min via TTL below).
    // It gets hashed exactly once by User's pre-save hook when the real
    // account is created in verifyOtp — hashing it here too would double-hash it.
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "seller"],
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    latitude: Number,
    longitude: Number,
    otp: {
        type: String,
        required: true,
    },
    otpExpiry: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900, // TTL: MongoDB auto-deletes this doc 15 minutes after createdAt
    },
})

export const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema)
