import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'tag' },
  },
  { timestamps: true }
);

// One user can't have two "Food" expense categories
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);
