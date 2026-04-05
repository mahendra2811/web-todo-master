'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createListSchema } from '@/lib/validators/list';
import { DEFAULT_LIST_COLORS } from '@/lib/utils/constants';
import { toast } from 'sonner';

interface CreateListModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; description?: string; color?: string }) => Promise<unknown>;
}

export function CreateListModal({ open, onClose, onCreate }: CreateListModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_LIST_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createListSchema.safeParse({ name, description: description || undefined, color });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await onCreate(result.data);
      setName('');
      setDescription('');
      setColor(DEFAULT_LIST_COLORS[0]);
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create List">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="My List"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
