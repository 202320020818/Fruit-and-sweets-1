import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  userDeliveryDetailsId: { 
    type: String, 
    required: true 
  },
  items: [
    {
      name: { 
        type: String, 
        required: true 
      },
      price: { 
        type: Number, 
        required: true 
      },
      quantity: { 
        type: Number, 
        default: 1 
      },
    }, 
  ],
  paymentStatus: { 
    type: String, 
    required: true 
  },
  paymentIntentId: { 
    type: String 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.model('Order', orderSchema);