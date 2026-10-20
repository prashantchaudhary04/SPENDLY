import { Budget } from '../models/Budget.js';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { ApiError } from '../utils/ApiError.js';
import { currentMonth, monthRange, round2 } from '../utils/dates.js';

// Budgets for a month, each with how much has been spent so far
export async function listBudgets(req, res) {
  const month = req.validatedQuery.month ?? currentMonth();
  const { start, end } = monthRange(month);

  const [budgets, spentRows] = await Promise.all([
    Budget.find({ user: req.user._id, month }).populate('category', 'name color icon'),
    Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]),
  ]);

  const spentByCategory = new Map(spentRows.map((r) => [String(r._id), r.spent]));

  const data = budgets
    .filter((b) => b.category)
    .map((b) => {
      const spent = round2(spentByCategory.get(String(b.category._id)) ?? 0);
      const percentUsed = Math.round((spent / b.limit) * 100);
      const status = spent > b.limit ? 'over' : percentUsed >= 80 ? 'warning' : 'ok';
      return {
        id: b._id,
        month,
        category: b.category,
        limit: b.limit,
        spent,
        remaining: round2(b.limit - spent),
        percentUsed,
        status,
      };
    });

  res.json({ month, budgets: data });
}

// Create the budget, or update the limit if one already exists for that category + month
export async function setBudget(req, res) {
  const { category, month, limit } = req.body;

  const cat = await Category.findOne({ _id: category, user: req.user._id });
  if (!cat || cat.type !== 'expense') {
    throw new ApiError(400, 'Budgets can only be set on your expense categories');
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category, month },
    { limit },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ budget });
}

export async function updateBudget(req, res) {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { limit: req.body.limit },
    { new: true, runValidators: true }
  );
  if (!budget) throw new ApiError(404, 'Budget not found');
  res.json({ budget });
}

export async function deleteBudget(req, res) {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!budget) throw new ApiError(404, 'Budget not found');
  res.json({ message: 'Budget deleted' });
}
