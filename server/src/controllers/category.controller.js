import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { ApiError } from '../utils/ApiError.js';

export async function listCategories(req, res) {
  const categories = await Category.find({ user: req.user._id }).sort({ type: 1, name: 1 });
  res.json({ categories });
}

export async function createCategory(req, res) {
  const category = await Category.create({ ...req.body, user: req.user._id });
  res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  // Filtering by user too means you can never edit someone else's category
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ category });
}

export async function deleteCategory(req, res) {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) throw new ApiError(404, 'Category not found');

  if (await Transaction.exists({ user: req.user._id, category: category._id })) {
    throw new ApiError(409, 'Category is used by transactions. Move or delete them first.');
  }

  await Budget.deleteMany({ user: req.user._id, category: category._id });
  await category.deleteOne();
  res.json({ message: 'Category deleted' });
}
