import { createClient } from "@/lib/supabase/client";
import type { ExportData, ConflictDetection } from "@/types/export";

/**
 * Detects potential conflicts when importing data
 */
export async function detectConflicts(
  importData: ExportData,
  userId: string
): Promise<ConflictDetection> {
  const supabase = createClient();

  // Get existing lists for the user
  const { data: existingLists, error } = await supabase
    .from("lists")
    .select("name")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching existing lists:", error);
    return {
      hasDuplicates: false,
      duplicateListNames: [],
    };
  }

  // Find duplicate list names
  const existingListNames = new Set(existingLists?.map((l) => l.name.toLowerCase()) || []);
  const duplicateListNames = (importData.lists as Array<{ name: string }>)
    .filter((list) => existingListNames.has(list.name.toLowerCase()))
    .map((list) => list.name);

  if (duplicateListNames.length > 0) {
    return {
      hasDuplicates: true,
      duplicateListNames,
      message: `Found ${duplicateListNames.length} list${
        duplicateListNames.length > 1 ? "s" : ""
      } with duplicate names: ${duplicateListNames.join(", ")}. These will be imported as separate lists.`,
    };
  }

  return {
    hasDuplicates: false,
    duplicateListNames: [],
  };
}

/**
 * Checks if the import data was exported by a different user
 */
export function isDifferentUser(importData: ExportData, currentUserId: string): boolean {
  if (!importData.exportedBy?.userId) {
    return false;
  }
  return importData.exportedBy.userId !== currentUserId;
}

/**
 * Gets a summary of what will be imported
 */
export function getImportSummary(data: ExportData): string {
  const parts: string[] = [];

  if (data.lists.length > 0) {
    parts.push(`${data.lists.length} list${data.lists.length > 1 ? "s" : ""}`);
  }

  if (data.todos.length > 0) {
    parts.push(`${data.todos.length} todo${data.todos.length > 1 ? "s" : ""}`);
  }

  if (data.subtasks.length > 0) {
    parts.push(`${data.subtasks.length} subtask${data.subtasks.length > 1 ? "s" : ""}`);
  }

  if (data.tags.length > 0) {
    parts.push(`${data.tags.length} tag${data.tags.length > 1 ? "s" : ""}`);
  }

  return parts.length > 0 ? parts.join(", ") : "No data";
}
