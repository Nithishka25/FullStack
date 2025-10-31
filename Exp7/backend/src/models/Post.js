import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false, maxlength: 280, trim: true },
    imageUrl: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      new Schema(
        {
          author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          content: { type: String, required: true, maxlength: 280, trim: true }
        },
        { timestamps: { createdAt: true, updatedAt: false } }
      )
    ]
  },
  { timestamps: true }
);

PostSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('Post', PostSchema);
