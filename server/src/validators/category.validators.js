import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must look like #1a2b3c');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40),
  type: z.enum(['income', 'expense']),
  color: hexColor.default('#6366f1'),
  icon: z.string().trim().max(30).default('tag'),
});

// The type can't change after creation: existing transactions depend on it
export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    color: hexColor,
    icon: z.string().trim().max(30),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Send at least one field to update');
