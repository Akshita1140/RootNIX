import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },

        category: {
            type: String,
            required: [true, "Product category is required"],
            enum: [
                "Indoor Plants",
                "Outdoor Plants",
                "Rare Plants",
                "Medicinal Plants",
                "Succulents",
                "Seeds",
                "Tools",
                "Fertilizers",
                "Pots",
                "Other",
            ],
        },

        stock: {
            type: Number,
            required: [true, "Stock is required"],
            min: [0, "Stock cannot be negative"],
            default: 0,
        },

        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                publicId: {
                    type: String,
                },
            },
        ],

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        careLevel: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Easy",
        },

        lightRequirement: {
            type: String,
            enum: ["Low Light", "Indirect Light", "Bright Light", "Full Sun"],
            default: "Indirect Light",
        },

        wateringFrequency: {
            type: String,
            enum: ["Daily", "Twice a week", "Weekly", "Occasionally"],
            default: "Weekly",
        },
        soilType: {
            type: String,
            enum: [
                "Well-draining Soil",
                "Loamy Soil",
                "Sandy Soil",
                "Clay Soil",
                "Cactus Mix",
                "Orchid Mix",
                "Peat-based Mix",
                "Compost-rich Soil",
                "Other",
            ],
            default: "Well-draining Soil",
        },

        isAvailable: {
            type: Boolean,
            default: true,
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
    },
    {
        timestamps: true,
    }
)

export const Product = mongoose.model("Product", productSchema)