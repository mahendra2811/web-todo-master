import type { Database } from './database';

export type Todo = Database['public']['Tables']['todos']['Row'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];

export type Subtask = Database['public']['Tables']['subtasks']['Row'];
export type SubtaskInsert = Database['public']['Tables']['subtasks']['Insert'];
export type SubtaskUpdate = Database['public']['Tables']['subtasks']['Update'];

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];

export type TodoWithSubtasks = Todo & {
  subtasks: Subtask[];
  tags: Tag[];
};
