import { Category } from '../models/Category.js';

const defaults = [
  { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { name: 'Transport', type: 'expense', color: '#f59e0b', icon: 'car' },
  { name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping-bag' },
  { name: 'Bills & Utilities', type: 'expense', color: '#3b82f6', icon: 'zap' },
  { name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: 'film' },
  { name: 'Health', type: 'expense', color: '#10b981', icon: 'heart-pulse' },
  { name: 'Education', type: 'expense', color: '#06b6d4', icon: 'book-open' },
  { name: 'Other', type: 'expense', color: '#64748b', icon: 'tag' },
  { name: 'Salary', type: 'income', color: '#22c55e', icon: 'briefcase' },
  { name: 'Freelance', type: 'income', color: '#14b8a6', icon: 'laptop' },
  { name: 'Investments', type: 'income', color: '#6366f1', icon: 'trending-up' },
  { name: 'Other Income', type: 'income', color: '#84cc16', icon: 'plus-circle' },
];

export function createDefaultCategories(userId) {
  return Category.insertMany(defaults.map((c) => ({ ...c, user: userId })));
}
