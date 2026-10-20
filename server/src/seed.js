import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { Transaction } from './models/Transaction.js';
import { Budget } from './models/Budget.js';
import { createDefaultCategories } from './utils/defaultCategories.js';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo@1234';

// Small deterministic random generator so the demo data looks the same every run
function makeRng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXPENSES = [
  { category: 'Food & Dining', min: 120, max: 900, notes: ['Lunch', 'Dinner out', 'Groceries', 'Coffee', 'Swiggy order'] },
  { category: 'Transport', min: 50, max: 600, notes: ['Auto fare', 'Metro card', 'Fuel', 'Cab ride'] },
  { category: 'Shopping', min: 400, max: 4000, notes: ['Clothes', 'Headphones', 'Home items', 'Books'] },
  { category: 'Bills & Utilities', min: 300, max: 3000, notes: ['Electricity bill', 'Internet', 'Mobile recharge', 'Water bill'] },
  { category: 'Entertainment', min: 150, max: 1500, notes: ['Movie tickets', 'Netflix', 'Concert', 'Games'] },
  { category: 'Health', min: 200, max: 2000, notes: ['Pharmacy', 'Doctor visit', 'Gym fee'] },
  { category: 'Education', min: 500, max: 3000, notes: ['Online course', 'Study material'] },
];

async function seed() {
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('Refusing to seed in production without --force');
    process.exit(1);
  }

  await connectDB();

  // Remove any previous demo data
  const old = await User.findOne({ email: DEMO_EMAIL });
  if (old) {
    await Promise.all([
      Transaction.deleteMany({ user: old._id }),
      Category.deleteMany({ user: old._id }),
      Budget.deleteMany({ user: old._id }),
    ]);
    await User.deleteOne({ _id: old._id });
  }

  const user = await User.create({
    name: 'Demo User',
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
  });
  await createDefaultCategories(user._id);

  const categories = await Category.find({ user: user._id });
  const byName = (name) => categories.find((c) => c.name === name);

  const rand = makeRng(42);
  const between = (min, max) => Math.round(min + rand() * (max - min));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const now = new Date();
  const transactions = [];

  for (let offset = 5; offset >= 0; offset--) {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() - offset;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const maxDay = offset === 0 ? now.getUTCDate() : daysInMonth; // no future dates
    const dateOn = (day) => new Date(Date.UTC(year, month, Math.min(day, maxDay), 12));

    transactions.push({
      user: user._id, type: 'income', category: byName('Salary')._id,
      amount: 60000, date: dateOn(1), note: 'Monthly salary',
    });

    if (rand() > 0.4) {
      transactions.push({
        user: user._id, type: 'income', category: byName('Freelance')._id,
        amount: between(5000, 18000), date: dateOn(between(5, 25)), note: 'Freelance project',
      });
    }

    const count = between(20, 28);
    for (let i = 0; i < count; i++) {
      const spec = pick(EXPENSES);
      transactions.push({
        user: user._id, type: 'expense', category: byName(spec.category)._id,
        amount: between(spec.min, spec.max), date: dateOn(between(1, daysInMonth)), note: pick(spec.notes),
      });
    }
  }

  await Transaction.insertMany(transactions);

  const month = now.toISOString().slice(0, 7);
  const budgets = [
    ['Food & Dining', 8000], ['Transport', 3000], ['Shopping', 6000], ['Entertainment', 2500],
  ];
  await Budget.insertMany(
    budgets.map(([name, limit]) => ({ user: user._id, category: byName(name)._id, month, limit }))
  );

  console.log(`Seeded ${transactions.length} transactions for ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
