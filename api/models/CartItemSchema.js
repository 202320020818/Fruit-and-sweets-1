import mongoose from "mongoose";


const CartItemSchema = new mongoose.Schema(
    {
      userId: { type: String, required: true }, // Changed from ObjectId to String
      itemId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
    { timestamps: true } // This adds `createdAt` and `updatedAt` automatically
  );

const CartItem = mongoose.model("CartItem", CartItemSchema);
export default CartItem;