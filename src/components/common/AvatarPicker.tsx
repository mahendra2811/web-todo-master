"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

// Inline SVG cartoon avatars — each is a unique character
const AVATARS: { id: string; label: string; svg: string; bg: string }[] = [
  {
    id: "man-1",
    label: "Man with glasses",
    bg: "#dbeafe",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#dbeafe"/><circle cx="40" cy="35" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#3b82f6"/><circle cx="33" cy="32" r="3" fill="#1e293b"/><circle cx="47" cy="32" r="3" fill="#1e293b"/><rect x="28" y="29" width="12" height="6" rx="3" stroke="#475569" stroke-width="1.5" fill="none"/><rect x="40" y="29" width="12" height="6" rx="3" stroke="#475569" stroke-width="1.5" fill="none"/><line x1="40" y1="29" x2="40" y2="35" stroke="#475569" stroke-width="1.5"/><path d="M35 40 Q40 44 45 40" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M22 28 Q30 15 50 15 Q58 15 58 28" stroke="#92400e" stroke-width="3" fill="#92400e" stroke-linecap="round"/></svg>`,
  },
  {
    id: "woman-1",
    label: "Woman with long hair",
    bg: "#fce7f3",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fce7f3"/><circle cx="40" cy="35" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#ec4899"/><circle cx="34" cy="32" r="2.5" fill="#1e293b"/><circle cx="46" cy="32" r="2.5" fill="#1e293b"/><path d="M36 40 Q40 43 44 40" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M20 30 Q22 12 40 12 Q58 12 60 30 L62 55 Q55 50 55 35" stroke="#7c2d12" stroke-width="3" fill="#7c2d12"/><path d="M20 30 L18 55 Q25 50 25 35" stroke="#7c2d12" stroke-width="3" fill="#7c2d12"/></svg>`,
  },
  {
    id: "man-2",
    label: "Man with beard",
    bg: "#dcfce7",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#dcfce7"/><circle cx="40" cy="33" r="18" fill="#fed7aa"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#22c55e"/><circle cx="34" cy="30" r="2.5" fill="#1e293b"/><circle cx="46" cy="30" r="2.5" fill="#1e293b"/><path d="M30 38 Q40 48 50 38" fill="#92400e"/><path d="M24 24 Q30 14 50 14 Q56 14 56 24" fill="#1e293b"/></svg>`,
  },
  {
    id: "woman-2",
    label: "Woman with bun",
    bg: "#f3e8ff",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#f3e8ff"/><circle cx="40" cy="36" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#a855f7"/><circle cx="34" cy="33" r="2.5" fill="#1e293b"/><circle cx="46" cy="33" r="2.5" fill="#1e293b"/><path d="M36 41 Q40 44 44 41" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="40" cy="14" r="8" fill="#1e293b"/><path d="M22 30 Q25 18 40 18 Q55 18 58 30" fill="#1e293b"/></svg>`,
  },
  {
    id: "man-3",
    label: "Man with cap",
    bg: "#fee2e2",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fee2e2"/><circle cx="40" cy="36" r="18" fill="#fed7aa"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#ef4444"/><circle cx="34" cy="34" r="2.5" fill="#1e293b"/><circle cx="46" cy="34" r="2.5" fill="#1e293b"/><path d="M36 41 Q40 44 44 41" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M22 28 L58 28 L56 22 Q48 16 32 16 L24 22 Z" fill="#ef4444"/><rect x="20" y="27" width="40" height="4" rx="2" fill="#b91c1c"/></svg>`,
  },
  {
    id: "woman-3",
    label: "Woman with short hair",
    bg: "#fef9c3",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fef9c3"/><circle cx="40" cy="35" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#eab308"/><circle cx="34" cy="32" r="2.5" fill="#1e293b"/><circle cx="46" cy="32" r="2.5" fill="#1e293b"/><path d="M36 40 Q40 43 44 40" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M22 32 Q24 16 40 14 Q56 16 58 32 Q56 28 50 26 L30 26 Q24 28 22 32Z" fill="#fbbf24"/></svg>`,
  },
  {
    id: "man-4",
    label: "Man curly hair",
    bg: "#e0f2fe",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#e0f2fe"/><circle cx="40" cy="36" r="18" fill="#d4a574"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#0ea5e9"/><circle cx="34" cy="33" r="2.5" fill="#1e293b"/><circle cx="46" cy="33" r="2.5" fill="#1e293b"/><path d="M36 41 Q40 44 44 41" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="28" cy="20" r="5" fill="#1e293b"/><circle cx="36" cy="16" r="5" fill="#1e293b"/><circle cx="44" cy="16" r="5" fill="#1e293b"/><circle cx="52" cy="20" r="5" fill="#1e293b"/><circle cx="40" cy="14" r="4" fill="#1e293b"/></svg>`,
  },
  {
    id: "woman-4",
    label: "Woman with headband",
    bg: "#ccfbf1",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#ccfbf1"/><circle cx="40" cy="35" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#14b8a6"/><circle cx="34" cy="32" r="2.5" fill="#1e293b"/><circle cx="46" cy="32" r="2.5" fill="#1e293b"/><path d="M36 40 Q40 43 44 40" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M22 28 Q28 14 40 12 Q52 14 58 28" fill="#78350f" stroke="none"/><rect x="22" y="22" width="36" height="4" rx="2" fill="#f43f5e"/></svg>`,
  },
  {
    id: "man-5",
    label: "Man formal",
    bg: "#e2e8f0",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#e2e8f0"/><circle cx="40" cy="34" r="18" fill="#fed7aa"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#334155"/><circle cx="34" cy="31" r="2.5" fill="#1e293b"/><circle cx="46" cy="31" r="2.5" fill="#1e293b"/><path d="M36 39 Q40 42 44 39" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M25 26 Q30 14 40 12 Q50 14 55 26" fill="#475569"/><polygon points="40,52 36,58 44,58" fill="white"/><line x1="40" y1="58" x2="40" y2="68" stroke="#1e293b" stroke-width="1.5"/></svg>`,
  },
  {
    id: "woman-5",
    label: "Woman professional",
    bg: "#fae8ff",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fae8ff"/><circle cx="40" cy="35" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#d946ef"/><circle cx="34" cy="32" r="2.5" fill="#1e293b"/><circle cx="46" cy="32" r="2.5" fill="#1e293b"/><path d="M36 40 Q40 43 44 40" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M20 32 Q22 14 40 12 Q58 14 60 32 L58 38 Q56 30 50 28 L30 28 Q24 30 22 38Z" fill="#581c87"/></svg>`,
  },
  {
    id: "man-6",
    label: "Man sporty",
    bg: "#fff7ed",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fff7ed"/><circle cx="40" cy="35" r="18" fill="#d4a574"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#f97316"/><circle cx="34" cy="32" r="2.5" fill="#1e293b"/><circle cx="46" cy="32" r="2.5" fill="#1e293b"/><path d="M34 40 Q40 45 46 40" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M24 26 Q32 16 48 16 Q56 16 56 26" fill="#1e293b"/><rect x="24" y="24" width="32" height="3" rx="1.5" fill="#f97316"/></svg>`,
  },
  {
    id: "woman-6",
    label: "Woman casual",
    bg: "#ffe4e6",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#ffe4e6"/><circle cx="40" cy="35" r="18" fill="#fed7aa"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#fb7185"/><circle cx="34" cy="32" r="2.5" fill="#1e293b"/><circle cx="46" cy="32" r="2.5" fill="#1e293b"/><path d="M36 40 Q40 43 44 40" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M20 30 Q24 12 40 10 Q56 12 60 30 L62 50 Q58 42 56 35" fill="#b45309"/><path d="M20 30 L18 50 Q22 42 24 35" fill="#b45309"/></svg>`,
  },
  {
    id: "neutral-1",
    label: "Robot",
    bg: "#f1f5f9",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#f1f5f9"/><rect x="24" y="22" width="32" height="28" rx="6" fill="#94a3b8"/><rect x="28" y="50" width="24" height="16" rx="4" fill="#64748b"/><rect x="30" y="30" width="8" height="6" rx="2" fill="#22d3ee"/><rect x="42" y="30" width="8" height="6" rx="2" fill="#22d3ee"/><rect x="34" y="40" width="12" height="3" rx="1.5" fill="#475569"/><line x1="40" y1="14" x2="40" y2="22" stroke="#94a3b8" stroke-width="2"/><circle cx="40" cy="12" r="3" fill="#22d3ee"/></svg>`,
  },
  {
    id: "neutral-2",
    label: "Cat",
    bg: "#fef3c7",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fef3c7"/><circle cx="40" cy="40" r="20" fill="#fbbf24"/><polygon points="24,28 28,12 36,26" fill="#fbbf24"/><polygon points="56,28 52,12 44,26" fill="#fbbf24"/><circle cx="34" cy="36" r="3" fill="#1e293b"/><circle cx="46" cy="36" r="3" fill="#1e293b"/><ellipse cx="40" cy="42" rx="3" ry="2" fill="#fb923c"/><path d="M37 44 Q40 47 43 44" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><line x1="22" y1="38" x2="32" y2="40" stroke="#1e293b" stroke-width="1"/><line x1="22" y1="42" x2="32" y2="41" stroke="#1e293b" stroke-width="1"/><line x1="58" y1="38" x2="48" y2="40" stroke="#1e293b" stroke-width="1"/><line x1="58" y1="42" x2="48" y2="41" stroke="#1e293b" stroke-width="1"/></svg>`,
  },
  {
    id: "neutral-3",
    label: "Astronaut",
    bg: "#e0e7ff",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#e0e7ff"/><circle cx="40" cy="34" r="20" fill="white" stroke="#94a3b8" stroke-width="2"/><ellipse cx="40" cy="60" rx="18" ry="12" fill="#e2e8f0"/><rect x="30" y="28" width="20" height="14" rx="7" fill="#bfdbfe"/><circle cx="36" cy="33" r="2" fill="#1e293b"/><circle cx="44" cy="33" r="2" fill="#1e293b"/><path d="M37 38 Q40 40 43 38" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="22" cy="36" r="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><circle cx="58" cy="36" r="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
  },
  {
    id: "neutral-4",
    label: "Ninja",
    bg: "#1e293b",
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#1e293b"/><circle cx="40" cy="35" r="18" fill="#fde68a"/><ellipse cx="40" cy="58" rx="22" ry="14" fill="#374151"/><rect x="18" y="28" width="44" height="10" rx="2" fill="#1e293b"/><circle cx="34" cy="33" r="2.5" fill="white"/><circle cx="46" cy="33" r="2.5" fill="white"/><circle cx="34" cy="33" r="1.2" fill="#1e293b"/><circle cx="46" cy="33" r="1.2" fill="#1e293b"/></svg>`,
  },
];

interface AvatarPickerProps {
  value: string | null;
  onChange: (avatarId: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  const selected = AVATARS.find((a) => a.id === value);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative h-16 w-16 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-indigo-300 transition-all"
        style={{ backgroundColor: selected?.bg || "#e0e7ff" }}
      >
        {selected ? (
          <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: selected.svg }} />
        ) : (
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-4 sm:grid-cols-5 gap-2 p-3 rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => {
                onChange(avatar.id);
                setOpen(false);
              }}
              title={avatar.label}
              className={cn(
                "h-14 w-14 rounded-full overflow-hidden transition-all",
                value === avatar.id
                  ? "ring-2 ring-indigo-500 ring-offset-2"
                  : "hover:ring-2 hover:ring-gray-300"
              )}
              style={{ backgroundColor: avatar.bg }}
            >
              <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: avatar.svg }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Export for use outside settings (e.g. sidebar, header)
export function getAvatarById(id: string | null) {
  return AVATARS.find((a) => a.id === id) || null;
}
