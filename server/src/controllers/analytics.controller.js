import { Transaction } from '../models/Transaction.js';
import { currentMonth, monthRange, round2 } from '../utils/dates.js';

// Income, expense and balance for one month, plus the all-time balance
export async function summary(req, res) {
  const month = req.validatedQuery.month ?? currentMonth();
  const { start, end } = monthRange(month);

  // $facet runs two pipelines on the same matched documents in one round trip
  const [result] = await Transaction.aggregate([
    { $match: { user: req.user._id } },
    {
      $facet: {
        month: [
          { $match: { date: { $gte: start, $lt: end } } },
          { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ],
        allTime: [{ $group: { _id: '$type', total: { $sum: '$amount' } } }],
      },
    },
  ]);

  const pick = (rows, type, field = 'total') => rows.find((r) => r._id === type)?.[field] ?? 0;

  const income = pick(result.month, 'income');
  const expense = pick(result.month, 'expense');

  res.json({
    month,
    income: round2(income),
    expense: round2(expense),
    balance: round2(income - expense),
    transactionCount: pick(result.month, 'income', 'count') + pick(result.month, 'expense', 'count'),
    allTimeBalance: round2(pick(result.allTime, 'income') - pick(result.allTime, 'expense')),
  });
}

// Total per category for a month (for the pie/donut chart)
export async function byCategory(req, res) {
  const { type } = req.validatedQuery;
  const month = req.validatedQuery.month ?? currentMonth();
  const { start, end } = monthRange(month);

  const rows = await Transaction.aggregate([
    { $match: { user: req.user._id, type, date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        name: '$category.name',
        color: '$category.color',
        icon: '$category.icon',
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  res.json({
    month,
    type,
    total: round2(grandTotal),
    categories: rows.map((r) => ({
      ...r,
      total: round2(r.total),
      percentage: grandTotal ? round2((r.total / grandTotal) * 100) : 0,
    })),
  });
}

// Income vs expense for each of the last N months (for the line/bar chart)
export async function trend(req, res) {
  const { months } = req.validatedQuery;

  const now = new Date();
  const startYear = now.getUTCFullYear();
  const startMonth = now.getUTCMonth() - (months - 1);
  const start = new Date(Date.UTC(startYear, startMonth, 1));

  const rows = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: start } } },
    {
      $group: {
        _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totals = new Map(rows.map((r) => [`${r._id.month}|${r._id.type}`, r.total]));

  // MongoDB skips months with no data, so we fill the gaps with zeros
  const data = [];
  for (let i = 0; i < months; i++) {
    const key = new Date(Date.UTC(startYear, startMonth + i, 1)).toISOString().slice(0, 7);
    const income = round2(totals.get(`${key}|income`) ?? 0);
    const expense = round2(totals.get(`${key}|expense`) ?? 0);
    data.push({ month: key, income, expense, balance: round2(income - expense) });
  }

  res.json({ trend: data });
}
