'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { updateListSchema } from '@/lib/validators/list';
import { DEFAULT_LIST_COLORS } from '@/lib/utils/constants';
import { toast } from 'sonner';
import type { ListWithCounts } from '@/types/list';

interface EditListModalProps {
  open: boolean;
  onClose: () => void;
  list: ListWithCounts;
  onUpdate: (id: string, updates: { name?: string; description?: string; color?: string; icon?: string }) => Promise<unknown>;
}

export function EditListModal({ open, onClose, list, onUpdate }: EditListModalProps) {
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || '');
  const [color, setColor] = useState(list.color || DEFAULT_LIST_COLORS[0]);
  const [icon, setIcon] = useState(list.icon || '📋');
  const [loading, setLoading] = useState(false);

  // Sync state when list changes or modal opens
  useEffect(() => {
    if (open) {
      setName(list.name);
      setDescription(list.description || '');
      setColor(list.color || DEFAULT_LIST_COLORS[0]);
      setIcon(list.icon || '📋');
    }
  }, [open, list]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = updateListSchema.safeParse({
      name,
      description: description || undefined,
      color,
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await onUpdate(list.id, { ...result.data, icon });
      toast.success('List updated');
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit List">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <EmojiPicker value={icon} onChange={setIcon} />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none h-9"
              placeholder="My List"
              required
              autoFocus
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="Optional description"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex gap-2 flex-wrap">
            {DEFAULT_LIST_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${
                  color === c ? 'border-gray-900 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
