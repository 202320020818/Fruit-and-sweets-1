import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  price: Number,
  image: String,
  description: String,
  category: String, 
  customCategory: String, 
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  createdBy: String,
  updatedBy: String,
}, { timestamps: true });

export default mongoose.model('WishlistItem', WishlistSchema);
