import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 200, default: '' },

    // Recurring "template": the cron job copies it whenever nextDate arrives
    isRecurring: { type: Boolean, default: false },
    recurrence: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      nextDate: { type: Date },
    },
    // Set on the copies the cron job creates
    recurringSource: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

// Indexes match our most common queries (list by date, group by category, cron lookup)
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ isRecurring: 1, 'recurrence.nextDate': 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
