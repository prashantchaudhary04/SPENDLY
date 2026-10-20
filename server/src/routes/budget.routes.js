import { Router } from 'express';
import {
  listBudgets,
  setBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, validateId } from '../middleware/validate.js';
import {
  setBudgetSchema,
  updateBudgetSchema,
  budgetQuery,
} from '../validators/budget.validators.js';

const router = Router();

router.use(protect);

router.get('/', validate(budgetQuery, 'query'), listBudgets);
router.post('/', validate(setBudgetSchema), setBudget);
router.put('/:id', validateId, validate(updateBudgetSchema), updateBudget);
router.delete('/:id', validateId, deleteBudget);

export default router;
