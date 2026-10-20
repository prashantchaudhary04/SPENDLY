import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, // "2026-10"
    limit: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

// One budget per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model('Budget', budgetSchema);
