import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0').max(1_000_000_000),
  category: objectId,
  date: z.coerce.date().default(() => new Date()),
  note: z.string().trim().max(200).default(''),
  // "daily" | "weekly" | "monthly" makes it a recurring transaction
  recurrence: z.enum(['daily', 'weekly', 'monthly']).nullable().optional(),
});

// Every field optional, but at least one must be present.
// recurrence: null means "stop repeating".
export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Send at least one field to update');

export const listTransactionsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(['income', 'expense']).optional(),
  category: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['date', 'amount']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
