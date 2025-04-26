import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    userId:{ type: String, required: false },
    customerName: { type: String, required: false },
    phoneNo: { type: String, required: false }, // Mapping from mobileNumber
    email: { type: String, required: false },
    address: { type: String, required: false }, // Mapping from deliveryAddress
    postalCode: { type: String, required: false }, // Added postalCode
    district: { type: String, required: false }, // Added district

    deliveryType: { 
      type: String, 
      enum: ["1", "0"], 
      required: false 
    },

    deliveryService: { 
      type: String, 
      enum: ["uber", "pickme", "darazd", "fardar", "koombiyo"], 
      required: false 
    },

    amount: { type: Number, required: false },
    deliveryCharge: { type: Number, required: false },
    totalAmount: { type: Number },

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

const Delivery = mongoose.model("DeliveryDetials", deliverySchema);
export default Delivery;
