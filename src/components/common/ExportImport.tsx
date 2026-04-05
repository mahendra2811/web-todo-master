"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { ExportData, ImportMode, ImportAnalysis } from "@/types/export";
import {
  validateImportData,
  analyzeImportData,
  sanitizeForExport,
  filterImportData,
} from "@/lib/utils/export-validation";
import { detectConflicts, isDifferentUser, getImportSummary } from "@/lib/utils/conflict-detection";

export function ExportImport() {
  const user = useAuthStore((s) => s.user);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("merge" as ImportMode);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeArchived, setIncludeArchived] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    if (!user) return;
    setExporting(true);
    try {
      const supabase = createClient();

      const [listsRes, todosRes, subtasksRes, tagsRes, todoTagsRes] = await Promise.all([
        supabase.from("lists").select("*").order("position"),
        supabase.from("todos").select("*").order("position"),
        supabase.from("subtasks").select("*").order("position"),
        supabase.from("tags").select("*").order("name"),
        supabase.from("todo_tags").select("*"),
      ]);

      // Sanitize data by removing user_id fields
      const lists = sanitizeForExport(listsRes.data || []);
      const todos = sanitizeForExport(todosRes.data || []);
      const subtasks = sanitizeForExport(subtasksRes.data || []);
      const tags = sanitizeForExport(tagsRes.data || []);
      const todoTags = todoTagsRes.data || [];

      const exportData: ExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        exportedBy: {
          userId: user.id,
          email: user.email,
        },
        stats: {
          totalLists: lists.length,
          totalTodos: todos.length,
          totalSubtasks: subtasks.length,
          totalTags: tags.length,
        },
        lists,
        todos,
        subtasks,
        tags,
        todoTags,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `supatodo-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${exportData.stats?.totalLists || 0} lists, ${exportData.stats?.totalTodos || 0} todos`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the import data
      const validatedData = validateImportData(data);

      // Analyze the data
      const analysis = analyzeImportData(validatedData);

      // Check for conflicts
      const conflicts = await detectConflicts(validatedData, user.id);

      // Add conflict warning if found
      if (conflicts.hasDuplicates && conflicts.message) {
        analysis.warnings.push(conflicts.message);
      }

      // Check if different user
      if (isDifferentUser(validatedData, user.id)) {
        analysis.warnings.unshift(
          "⚠️ This data was exported by another user. All imported data will be assigned to you."
        );
      }

      setImportData(validatedData);
      setImportAnalysis(analysis);
      setShowImportPreview(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to read import file");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmImport() {
    if (!importData || !user) return;

    setImporting(true);
    setShowImportPreview(false);

    try {
      const supabase = createClient();

      // Filter data based on options
      const filteredData = filterImportData(importData, {
        includeCompleted,
        includeArchived,
      });

      // If replace mode, delete existing data
      if (importMode === "replace") {
        const { error: deleteError } = await supabase.from("lists").delete().eq("user_id", user.id);
        if (deleteError) throw deleteError;
      }

      // Create ID mappings (old ID → new ID)
      const listIdMap = new Map<string, string>();
      const todoIdMap = new Map<string, string>();
      const tagIdMap = new Map<string, string>();

      // Import lists
      for (const list of filteredData.lists) {
        const rec = list as Record<string, unknown>;
        const oldId = rec.id as string;
        const { data: newList, error } = await supabase
          .from("lists")
          .insert({
            name: rec.name as string,
            description: (rec.description as string) || null,
            color: (rec.color as string) || "#6366f1",
            icon: (rec.icon as string) || "list",
            position: (rec.position as number) || 0,
            is_archived: (rec.is_archived as boolean) || false,
            user_id: user.id,
          })
          .select("id")
          .single();
        if (error) throw error;
        listIdMap.set(oldId, newList.id);
      }

      // Import tags
      for (const tag of filteredData.tags) {
        const rec = tag as Record<string, unknown>;
        const oldId = rec.id as string;
        const { data: newTag, error } = await supabase
          .from("tags")
          .insert({
            name: rec.name as string,
            color: (rec.color as string) || "#8b5cf6",
            user_id: user.id,
          })
          .select("id")
          .single();
        if (error) {
          // Skip duplicate tags
          if (error.code === "23505") continue;
          throw error;
        }
        tagIdMap.set(oldId, newTag.id);
      }

      // Import todos
      for (const todo of filteredData.todos) {
        const rec = todo as Record<string, unknown>;
        const oldId = rec.id as string;
        const newListId = listIdMap.get(rec.list_id as string);
        if (!newListId) continue;
        const { data: newTodo, error } = await supabase
          .from("todos")
          .insert({
            title: rec.title as string,
            description: (rec.description as string) || null,
            priority: (rec.priority as string) || "medium",
            status: (rec.status as string) || "pending",
            due_date: (rec.due_date as string) || null,
            completed_at: (rec.completed_at as string) || null,
            position: (rec.position as number) || 0,
            is_pinned: (rec.is_pinned as boolean) || false,
            list_id: newListId,
            user_id: user.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .select("id")
          .single();
        if (error) throw error;
        todoIdMap.set(oldId, newTodo.id);
      }

      // Import subtasks
      for (const subtask of filteredData.subtasks) {
        const rec = subtask as Record<string, unknown>;
        const newTodoId = todoIdMap.get(rec.todo_id as string);
        if (!newTodoId) continue;
        await supabase.from("subtasks").insert({
          title: rec.title as string,
          is_completed: (rec.is_completed as boolean) || false,
          position: (rec.position as number) || 0,
          todo_id: newTodoId,
          user_id: user.id,
        });
      }

      // Import todo-tag associations
      for (const tt of filteredData.todoTags) {
        const rec = tt as Record<string, unknown>;
        const newTodoId = todoIdMap.get(rec.todo_id as string);
        const newTagId = tagIdMap.get(rec.tag_id as string);
        if (!newTodoId || !newTagId) continue;
        await supabase.from("todo_tags").insert({ todo_id: newTodoId, tag_id: newTagId });
      }

      const summary = getImportSummary(filteredData);
      toast.success(`Successfully imported ${summary}`);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      setImportData(null);
      setImportAnalysis(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function cancelImport() {
    setShowImportPreview(false);
    setImportData(null);
    setImportAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Data Export & Import
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Export all your lists, todos, subtasks, and tags as JSON. Import to restore or migrate
          data.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleExport} loading={exporting} variant="secondary" size="sm">
            Export All Data
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            loading={importing}
            variant="secondary"
            size="sm"
          >
            Import Data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Import Preview Modal */}
      <Modal
        open={showImportPreview}
        onClose={cancelImport}
        title="Import Preview"
        className="sm:max-w-2xl"
      >
        {importAnalysis && importData && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Import Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Lists:</span>{" "}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {importAnalysis.lists}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Todos:</span>{" "}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {importAnalysis.todos}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Subtasks:</span>{" "}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {importAnalysis.subtasks}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Tags:</span>{" "}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {importAnalysis.tags}
                  </span>
                </div>
              </div>
            </div>

            {/* Todo Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Todo Status Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                  <span className="font-medium">{importAnalysis.breakdown.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">In Progress:</span>
                  <span className="font-medium">{importAnalysis.breakdown.inProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                  <span className="font-medium">{importAnalysis.breakdown.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cancelled:</span>
                  <span className="font-medium">{importAnalysis.breakdown.cancelled}</span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {importAnalysis.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Warnings
                </h3>
                <ul className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
                  {importAnalysis.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Import Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Import Options
              </h3>

              {/* Import Mode */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Import Mode
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === "merge"}
                      onChange={(e) => setImportMode(e.target.value as ImportMode)}
                      className="text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Merge (add to existing data)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={(e) => setImportMode(e.target.value as ImportMode)}
                      className="text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Replace (delete all existing data)
                    </span>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCompleted}
                    onChange={(e) => setIncludeCompleted(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Include completed todos ({importAnalysis.breakdown.completed})
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeArchived}
                    onChange={(e) => setIncludeArchived(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Include archived lists</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={cancelImport} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button onClick={confirmImport} loading={importing} size="sm">
                {importMode === "replace" ? "Replace & Import" : "Import"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
