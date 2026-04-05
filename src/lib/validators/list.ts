import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color').optional(),
  icon: z.string().max(50).optional(),
});

export const updateListSchema = createListSchema.partial().extend({
  is_archived: z.boolean().optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
