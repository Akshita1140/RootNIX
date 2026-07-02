import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema({

    razorpayPaymentId: {
        type: String,
        required: true,
    },

    razorpayOrderId: {
        type: String,
        required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    cartSnapshot: { type: Array, required: true }, // what they tried to buy
    status: {
        type: String,
        enum: ["payment_received", "order_created", "refund_pending", "refunded", "refund_failed"],
        default: "payment_received",
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
}, { timestamps: true });

export const PaymentLog = mongoose.model("PaymentLog", paymentLogSchema);