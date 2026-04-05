import type { ExportData, ImportAnalysis } from "@/types/export";

/**
 * Validates the structure and content of import data
 */
export function validateImportData(data: unknown): ExportData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid export file: Not a valid JSON object");
  }

  const d = data as Record<string, unknown>;

  // Check version
  if (!d.version || typeof d.version !== "number") {
    throw new Error("Invalid export file: Missing or invalid version number");
  }

  if (d.version > 1) {
    throw new Error(
      `Unsupported export version: ${d.version}. Please update the app to import this file.`
    );
  }

  // Check required arrays
  if (!Array.isArray(d.lists)) {
    throw new Error("Invalid export file: Missing or invalid lists array");
  }

  if (!Array.isArray(d.todos)) {
    throw new Error("Invalid export file: Missing or invalid todos array");
  }

  if (!Array.isArray(d.subtasks)) {
    throw new Error("Invalid export file: Missing or invalid subtasks array");
  }

  if (!Array.isArray(d.tags)) {
    throw new Error("Invalid export file: Missing or invalid tags array");
  }

  if (!Array.isArray(d.todoTags)) {
    throw new Error("Invalid export file: Missing or invalid todoTags array");
  }

  // Check exportedAt
  if (!d.exportedAt || typeof d.exportedAt !== "string") {
    throw new Error("Invalid export file: Missing or invalid exportedAt timestamp");
  }

  return {
    version: d.version as number,
    exportedAt: d.exportedAt as string,
    exportedBy: d.exportedBy as ExportData["exportedBy"],
    stats: d.stats as ExportData["stats"],
    lists: d.lists as Record<string, unknown>[],
    todos: d.todos as Record<string, unknown>[],
    subtasks: d.subtasks as Record<string, unknown>[],
    tags: d.tags as Record<string, unknown>[],
    todoTags: d.todoTags as Record<string, unknown>[],
  };
}

/**
 * Analyzes import data to provide preview information
 */
export function analyzeImportData(data: ExportData): ImportAnalysis {
  const todos = data.todos as Array<{ status?: string; due_date?: string | null }>;

  const breakdown = {
    pending: todos.filter((t) => t.status === "pending").length,
    inProgress: todos.filter((t) => t.status === "in_progress").length,
    completed: todos.filter((t) => t.status === "completed").length,
    cancelled: todos.filter((t) => t.status === "cancelled").length,
  };

  const warnings: string[] = [];

  // Check for overdue tasks
  const now = new Date();
  const overdueTodos = todos.filter((t) => {
    if (!t.due_date || t.status === "completed" || t.status === "cancelled") {
      return false;
    }
    return new Date(t.due_date) < now;
  });

  if (overdueTodos.length > 0) {
    warnings.push(
      `Contains ${overdueTodos.length} overdue task${overdueTodos.length > 1 ? "s" : ""}`
    );
  }

  // Check for archived lists
  const archivedLists = (data.lists as Array<{ is_archived?: boolean }>).filter(
    (l) => l.is_archived
  );
  if (archivedLists.length > 0) {
    warnings.push(
      `Contains ${archivedLists.length} archived list${archivedLists.length > 1 ? "s" : ""}`
    );
  }

  // Check if exported by different user
  if (data.exportedBy?.userId) {
    warnings.push(
      "This data was exported by another user. All imported data will be assigned to you."
    );
  }

  return {
    lists: data.lists.length,
    todos: data.todos.length,
    subtasks: data.subtasks.length,
    tags: data.tags.length,
    breakdown,
    warnings,
  };
}

/**
 * Sanitizes data for export by removing sensitive/unnecessary fields
 */
export function sanitizeForExport<T extends Record<string, unknown>>(
  data: T[]
): Omit<T, "user_id">[] {
  return data.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_id, ...rest } = item;
    return rest as Omit<T, "user_id">;
  });
}

/**
 * Filters data based on import options
 */
export function filterImportData(
  data: ExportData,
  options: { includeCompleted: boolean; includeArchived: boolean }
): ExportData {
  let filteredTodos = data.todos;
  let filteredLists = data.lists;

  // Filter completed todos
  if (!options.includeCompleted) {
    const completedTodoIds = new Set(
      (data.todos as Array<{ id: string; status?: string }>)
        .filter((t) => t.status === "completed")
        .map((t) => t.id)
    );

    filteredTodos = data.todos.filter((t) => {
      const todo = t as { id: string; status?: string };
      return todo.status !== "completed";
    });

    // Also filter subtasks and todo_tags for completed todos
    data.subtasks = data.subtasks.filter((s) => {
      const subtask = s as { todo_id: string };
      return !completedTodoIds.has(subtask.todo_id);
    });

    data.todoTags = data.todoTags.filter((tt) => {
      const todoTag = tt as { todo_id: string };
      return !completedTodoIds.has(todoTag.todo_id);
    });
  }

  // Filter archived lists
  if (!options.includeArchived) {
    const archivedListIds = new Set(
      (data.lists as Array<{ id: string; is_archived?: boolean }>)
        .filter((l) => l.is_archived)
        .map((l) => l.id)
    );

    filteredLists = data.lists.filter((l) => {
      const list = l as { is_archived?: boolean };
      return !list.is_archived;
    });

    // Also filter todos from archived lists
    filteredTodos = filteredTodos.filter((t) => {
      const todo = t as { list_id: string };
      return !archivedListIds.has(todo.list_id);
    });
  }

  return {
    ...data,
    lists: filteredLists,
    todos: filteredTodos,
  };
}
