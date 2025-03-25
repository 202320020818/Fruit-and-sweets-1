import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    customerName: { type: String, required: true },
    phoneNo: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    
    deliveryType: { 
      type: String, 
      enum: ["Cash on Delivery", "Online Payment"], 
      required: true 
    },

    amount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    totalAmount: { type: Number},

    deliveryService: { 
      type: String, 
      enum: ["Uber", "PickMe"], 
      required: true 
    }, 

    status: {
      type: String,
      enum: ["Pending", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },

    estimatedTime: { type: String },
    completedAt: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

// Pre-save hook to calculate totalAmount before saving
deliverySchema.pre("save", function (next) {
  this.totalAmount = this.amount + this.deliveryCharge;
  next();
});

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;

