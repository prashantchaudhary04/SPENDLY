import { Router } from 'express';
import { summary, byCategory, trend } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  summaryQuery,
  byCategoryQuery,
  trendQuery,
} from '../validators/analytics.validators.js';

const router = Router();

router.use(protect);

router.get('/summary', validate(summaryQuery, 'query'), summary);
router.get('/by-category', validate(byCategoryQuery, 'query'), byCategory);
router.get('/trend', validate(trendQuery, 'query'), trend);

export default router;
