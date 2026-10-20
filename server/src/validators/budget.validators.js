import { z } from 'zod';
import { MONTH_REGEX } from '../utils/dates.js';

const month = z.string().regex(MONTH_REGEX, 'Month must look like 2026-10');

export const setBudgetSchema = z.object({
  category: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id'),
  month,
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(1_000_000_000),
});

export const updateBudgetSchema = z.object({
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(1_000_000_000),
});

export const budgetQuery = z.object({ month: month.optional() });
