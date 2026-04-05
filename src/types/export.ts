export interface ExportMetadata {
  userId: string;
  email?: string;
}

export interface ExportStats {
  totalLists: number;
  totalTodos: number;
  totalSubtasks: number;
  totalTags: number;
}

export interface ExportData {
  version: number;
  exportedAt: string;
  exportedBy?: ExportMetadata;
  stats?: ExportStats;
  lists: Record<string, unknown>[];
  todos: Record<string, unknown>[];
  subtasks: Record<string, unknown>[];
  tags: Record<string, unknown>[];
  todoTags: Record<string, unknown>[];
}

export enum ImportMode {
  MERGE = "merge",
  REPLACE = "replace",
}

export interface ImportOptions {
  mode: ImportMode;
  includeCompleted: boolean;
  includeArchived: boolean;
}

export interface ImportAnalysis {
  lists: number;
  todos: number;
  subtasks: number;
  tags: number;
  breakdown: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  warnings: string[];
}

export interface ConflictDetection {
  hasDuplicates: boolean;
  duplicateListNames: string[];
  message?: string;
}
