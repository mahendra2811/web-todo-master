import type { Database } from './database';

export type List = Database['public']['Tables']['lists']['Row'];
export type ListInsert = Database['public']['Tables']['lists']['Insert'];
export type ListUpdate = Database['public']['Tables']['lists']['Update'];

export type ListWithCounts = List & {
  todo_count: number;
  completed_count: number;
};
