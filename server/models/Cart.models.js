import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Seller" if you have a separate seller model
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
      default: 1,
    },
    priceAtAddition: {
      type: Number,
      required: true,
      min: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no need for separate _id on each item, productId is enough to identify it
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Recalculate totals automatically before saving
cartSchema.pre("save", function () {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtAddition,
    0
  );
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;