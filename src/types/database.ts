export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string;
          position: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          icon?: string;
          position?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          position?: number;
          is_archived?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      todos: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          due_date: string | null;
          completed_at: string | null;
          position: number;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          due_date?: string | null;
          position?: number;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          list_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          due_date?: string | null;
          position?: number;
          is_pinned?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'todos_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'todos_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      subtasks: {
        Row: {
          id: string;
          todo_id: string;
          user_id: string;
          title: string;
          is_completed: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          user_id: string;
          title: string;
          is_completed?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          is_completed?: boolean;
          position?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subtasks_todo_id_fkey';
            columns: ['todo_id'];
            isOneToOne: false;
            referencedRelation: 'todos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subtasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      todo_tags: {
        Row: {
          todo_id: string;
          tag_id: string;
        };
        Insert: {
          todo_id: string;
          tag_id: string;
        };
        Update: {
          todo_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'todo_tags_todo_id_fkey';
            columns: ['todo_id'];
            isOneToOne: false;
            referencedRelation: 'todos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'todo_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      todo_priority: 'low' | 'medium' | 'high' | 'urgent';
      todo_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      activity_action:
        | 'todo_created'
        | 'todo_updated'
        | 'todo_completed'
        | 'todo_deleted'
        | 'list_created'
        | 'list_updated'
        | 'list_deleted'
        | 'subtask_created'
        | 'subtask_completed'
        | 'subtask_deleted';
    };
    CompositeTypes: Record<string, never>;
  };
}
