import { Router } from 'express';
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, validateId } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuery,
} from '../validators/transaction.validators.js';

const router = Router();

router.use(protect);

router.get('/', validate(listTransactionsQuery, 'query'), listTransactions);
// "/export" must come before "/:id", otherwise "export" would be read as an id
router.get('/export', validate(listTransactionsQuery, 'query'), exportTransactions);
router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/:id', validateId, getTransaction);
router.put('/:id', validateId, validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', validateId, deleteTransaction);

export default router;
