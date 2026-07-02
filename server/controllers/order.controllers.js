import crypto from "crypto"
import Cart from "../models/Cart.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Product } from "../models/Products.models.js";
import {Order} from "../models/order.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import razorpayInstance from "../utils/razorpay.js";
import { PaymentLog } from "../models/paymentLog.models.js";


const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    throw new ApiErrors(400, "Cart is Empty.");
  }
  const orderItems = cart.items.map((item) => ({
    product: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,       // live price, not priceAtAddition
    quantity: item.quantity,
    image: item.productId.images[0]?.url,
    seller: item.sellerId,
  }));

  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 500 ? 0 : 40; // adjust threshold/fee to whatever you want
  const totalPrice = itemsPrice + shippingPrice;

  const { paymentMethod, shippingAddress, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!shippingAddress) {
    throw new ApiErrors(400, "Shipping Address is necessary")
  }
  let paymentStatus = "pending";

  if (paymentMethod === "razorpay") {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiErrors(400, "Missing payment verification details");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generatedSignature !== razorpay_signature) {
      throw new ApiErrors(400, "Payment Verification Failed.")
    }
    paymentStatus = "paid";
  }
  //Transactions 
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // all your writes go here, each one passed { session }
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate({ _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      )

      if (!updatedProduct) {
        throw new ApiErrors(400, `Insufficient for ${item.name}`)
      }
    }
    const order = await Order.create(
  [
    {
      user: userId,
      orderItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: paymentStatus,
      },
      itemsPrice,
      shippingPrice,
      totalPrice,
    },
  ],
  { session }
);

//cart clear
cart.items = [];
await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    // success response here
    res.status(201).json(
      new ApiResponse(
        201,
        order[0],
        "Order Created Successfully."
      )
    )
  } catch (err) {
    await session.abortTransaction();
    session.endSession();


    if(paymentMethod === "razorpay" && paymentStatus === "paid"){
      try {
        await razorpayInstance.payments.refund(razorpay_payment_id)
        await PaymentLog.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "refunded" }
      );
      } catch (error) {
        await PaymentLog.findOneAndUpdate({razorpayOrderId: razorpay_order_id},
          {
            status: "refund_failed"
          }
        )

      }
    }
    throw err; // or handle differently, e.g. refund logic
  }
})

export {createOrder}