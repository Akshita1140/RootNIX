import mongoose from "mongoose"

const sellerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        shopName: {
            type: String,
            required: [true, "Shop name is required"],
            trim: true,
            unique: true,
        },

        shopDescription: {
            type: String,
            trim: true,
            maxlength: [500, "Shop description cannot exceed 500 characters"],
        },

        businessEmail: {
            type: String,
            required: [true, "Business email is required"],
            trim: true,
            lowercase: true,
        },

        businessPhone: {
            type: String,
            required: [true, "Business phone is required"],
            trim: true,
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },

        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },

        logo: {
            url: {
                type: String,
            },
            publicId: {
                type: String,
            },
        },

        isVerifiedSeller: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending",
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        totalProducts: {
            type: Number,
            default: 0,
        },

        totalSales: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

export const SellerProfile = mongoose.model("SellerProfile", sellerProfileSchema)