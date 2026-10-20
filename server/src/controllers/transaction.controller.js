import { Transaction } from '../models/Transaction.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { addInterval, round2 } from '../utils/dates.js';
import { toCsv } from '../utils/csv.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Turns the validated query string into a MongoDB filter. Always scoped to the user.
function buildFilter(userId, q) {
  const filter = { user: userId };

  if (q.type) filter.type = q.type;
  if (q.category) filter.category = q.category;

  if (q.from || q.to) {
    filter.date = {};
    if (q.from) filter.date.$gte = q.from;
    if (q.to) {
      const endOfDay = new Date(q.to);
      endOfDay.setUTCHours(23, 59, 59, 999); // include the whole "to" day
      filter.date.$lte = endOfDay;
    }
  }

  if (q.search) {
    filter.note = { $regex: escapeRegex(q.search), $options: 'i' };
  }
  return filter;
}

// The category must belong to this user and match the transaction type
async function assertCategory(userId, categoryId, type) {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) throw new ApiError(400, 'Category not found');
  if (category.type !== type) {
    throw new ApiError(400, `"${category.name}" is an ${category.type} category`);
  }
}

const POPULATE = 'name color icon type';

export async function listTransactions(req, res) {
  const q = req.validatedQuery;
  const filter = buildFilter(req.user._id, q);
  const sort = { [q.sortBy]: q.order === 'asc' ? 1 : -1, _id: -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate('category', POPULATE),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    transactions,
    pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) },
  });
}

export async function getTransaction(req, res) {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('category', POPULATE);
  if (!transaction) throw new ApiError(404, 'Transaction not found');
  res.json({ transaction });
}

export async function createTransaction(req, res) {
  const { type, amount, category, date, note, recurrence } = req.body;
  await assertCategory(req.user._id, category, type);

  const data = { user: req.user._id, type, amount: round2(amount), category, date, note };

  if (recurrence) {
    data.isRecurring = true;
    data.recurrence = { frequency: recurrence, nextDate: addInterval(date, recurrence) };
  }

  const transaction = await Transaction.create(data);
  await transaction.populate('category', POPULATE);
  res.status(201).json({ transaction });
}

export async function updateTransaction(req, res) {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) throw new ApiError(404, 'Transaction not found');

  const { type, amount, category, date, note, recurrence } = req.body;

  // Re-check the category whenever the type or category changes
  if (type !== undefined || category !== undefined) {
    await assertCategory(req.user._id, category ?? transaction.category, type ?? transaction.type);
  }

  if (type !== undefined) transaction.type = type;
  if (amount !== undefined) transaction.amount = round2(amount);
  if (category !== undefined) transaction.category = category;
  if (date !== undefined) transaction.date = date;
  if (note !== undefined) transaction.note = note;

  if (recurrence === null) {
    transaction.isRecurring = false;
    transaction.recurrence = undefined;
  } else if (recurrence !== undefined) {
    transaction.isRecurring = true;
    transaction.recurrence = {
      frequency: recurrence,
      nextDate: addInterval(transaction.date, recurrence),
    };
  }

  await transaction.save();
  await transaction.populate('category', POPULATE);
  res.json({ transaction });
}

export async function deleteTransaction(req, res) {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!transaction) throw new ApiError(404, 'Transaction not found');
  res.json({ message: 'Transaction deleted' });
}

// Same filters as the list, but returns every match as a CSV file
export async function exportTransactions(req, res) {
  const filter = buildFilter(req.user._id, req.validatedQuery);
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .populate('category', 'name')
    .lean();

  const rows = [
    ['Date', 'Type', 'Category', 'Amount', 'Note'],
    ...transactions.map((t) => [
      t.date.toISOString().slice(0, 10),
      t.type,
      t.category?.name,
      t.amount,
      t.note,
    ]),
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send(toCsv(rows));
}
