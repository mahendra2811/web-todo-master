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
} from "@/lib/utils/export-validation";
import { detectConflicts, isDifferentUser, getImportSummary } from "@/lib/utils/conflict-detection";
import { executeImport } from "@/services/import-service";

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

      const lists = sanitizeForExport(listsRes.data || []);
      const todos = sanitizeForExport(todosRes.data || []);
      const subtasks = sanitizeForExport(subtasksRes.data || []);
      const tags = sanitizeForExport(tagsRes.data || []);
      const todoTags = todoTagsRes.data || [];

      const exportData: ExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        exportedBy: { userId: user.id, email: user.email },
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

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `todoMasterAI-export-${new Date().toISOString().slice(0, 10)}.json`;
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
      const validatedData = validateImportData(JSON.parse(text));
      const analysis = analyzeImportData(validatedData);
      const conflicts = await detectConflicts(validatedData, user.id);
      if (conflicts.hasDuplicates && conflicts.message) analysis.warnings.push(conflicts.message);
      if (isDifferentUser(validatedData, user.id)) {
        analysis.warnings.unshift(
          "This data was exported by another user. All imported data will be assigned to you."
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
      const filteredData = await executeImport(importData, user.id, {
        includeCompleted,
        includeArchived,
        mode: importMode,
      });
      toast.success(`Successfully imported ${getImportSummary(filteredData)}`);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      resetImportState();
    }
  }

  function resetImportState() {
    setImporting(false);
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

      <Modal
        open={showImportPreview}
        onClose={() => {
          setShowImportPreview(false);
          resetImportState();
        }}
        title="Import Preview"
        className="sm:max-w-2xl"
      >
        {importAnalysis && importData && (
          <div className="space-y-4">
            <ImportSummaryCard analysis={importAnalysis} />
            <ImportBreakdownCard analysis={importAnalysis} />
            {importAnalysis.warnings.length > 0 && (
              <ImportWarnings warnings={importAnalysis.warnings} />
            )}
            <ImportOptions
              importMode={importMode}
              setImportMode={setImportMode}
              includeCompleted={includeCompleted}
              setIncludeCompleted={setIncludeCompleted}
              includeArchived={includeArchived}
              setIncludeArchived={setIncludeArchived}
              completedCount={importAnalysis.breakdown.completed}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  setShowImportPreview(false);
                  resetImportState();
                }}
                variant="secondary"
                size="sm"
              >
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

function ImportSummaryCard({ analysis }: { analysis: ImportAnalysis }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Import Summary
      </h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {(["lists", "todos", "subtasks", "tags"] as const).map((key) => (
          <div key={key}>
            <span className="text-blue-700 dark:text-blue-300 capitalize">{key}:</span>{" "}
            <span className="font-semibold text-blue-900 dark:text-blue-100">{analysis[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportBreakdownCard({ analysis }: { analysis: ImportAnalysis }) {
  const items = [
    { label: "Pending", value: analysis.breakdown.pending },
    { label: "In Progress", value: analysis.breakdown.inProgress },
    { label: "Completed", value: analysis.breakdown.completed },
    { label: "Cancelled", value: analysis.breakdown.cancelled },
  ];
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Todo Status Breakdown
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Warnings</h3>
      <ul className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
        {warnings.map((w, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5">&#9888;&#65039;</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImportOptions({
  importMode,
  setImportMode,
  includeCompleted,
  setIncludeCompleted,
  includeArchived,
  setIncludeArchived,
  completedCount,
}: {
  importMode: ImportMode;
  setImportMode: (m: ImportMode) => void;
  includeCompleted: boolean;
  setIncludeCompleted: (v: boolean) => void;
  includeArchived: boolean;
  setIncludeArchived: (v: boolean) => void;
  completedCount: number;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Import Options</h3>
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Import Mode</label>
        <div className="flex gap-3">
          {[
            { value: "merge" as ImportMode, label: "Merge (add to existing data)" },
            { value: "replace" as ImportMode, label: "Replace (delete all existing data)" },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value={value}
                checked={importMode === value}
                onChange={(e) => setImportMode(e.target.value as ImportMode)}
                className="text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={includeCompleted}
            onChange={(e) => setIncludeCompleted(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-gray-700 dark:text-gray-300">
            Include completed todos ({completedCount})
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
  );
}
