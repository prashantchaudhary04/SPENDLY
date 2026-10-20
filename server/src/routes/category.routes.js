import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, validateId } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validators.js';

const router = Router();

router.use(protect); // every route below requires a logged-in user

router.get('/', listCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validateId, validate(updateCategorySchema), updateCategory);
router.delete('/:id', validateId, deleteCategory);

export default router;
