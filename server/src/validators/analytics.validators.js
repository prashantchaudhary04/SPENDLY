import { z } from 'zod';
import { MONTH_REGEX } from '../utils/dates.js';

const month = z.string().regex(MONTH_REGEX, 'Month must look like 2026-10');

export const summaryQuery = z.object({ month: month.optional() });

export const byCategoryQuery = z.object({
  month: month.optional(),
  type: z.enum(['income', 'expense']).default('expense'),
});

export const trendQuery = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});
