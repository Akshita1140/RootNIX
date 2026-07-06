import razorpayInstance from "../utils/razorpay.js";
import Cart from "../models/Cart.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
    throw new ApiErrors(400,"Cart is Empty.")
    }

    const amount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json(
      new ApiResponse(
        200,
        {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
      )
    )
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    throw new ApiErrors(500,"Could not initiate payment")
  }
});