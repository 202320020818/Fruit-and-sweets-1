import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.String, // still okay as String since you're using custom IDs like 'admin-panel-post'
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.String, // for simplicity in your current usage
      required: true,
    },
    likes: {
      type: [String], // explicitly define that this is an array of userId strings
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
