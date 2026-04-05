import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  list_id: z.string().uuid(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  due_date: z.string().datetime().optional().nullable(),
  is_pinned: z.boolean().optional(),
  position: z.number().int().optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  todo_id: z.string().uuid(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
