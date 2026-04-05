'use client';

import { useState } from 'react';

const EMOJI_LIST = [
  '📋', '📝', '✅', '🎯', '⭐', '🔥', '💡', '🚀',
  '🏠', '💼', '🎓', '🏋️', '🛒', '🎨', '🎵', '📚',
  '💰', '❤️', '🌱', '🍳', '🧹', '✈️', '🎮', '🐾',
  '📧', '🔧', '📊', '🎁', '🏖️', '⚡', '🌙', '☀️',
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {value || '📋'}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg p-2 grid grid-cols-8 gap-1 w-[min(18rem,calc(100vw-2rem))]">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className={`h-8 w-8 rounded flex items-center justify-center text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                value === emoji ? 'bg-indigo-50 dark:bg-indigo-900 ring-1 ring-indigo-300' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
