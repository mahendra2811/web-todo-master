'use client';

import { useState } from 'react';

const guides = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: 'Create your free account with just an email and password. Once signed in, you\'ll land on your dashboard — a clean overview of all your lists and tasks. Click "New List" to create your first list, give it a name and color, and start adding tasks.',
    tip: 'Use a descriptive list name like "Work Projects" or "Grocery Shopping" to keep things organized from day one.',
  },
  {
    id: 'managing-tasks',
    title: 'Managing Tasks',
    content: 'Create tasks by typing in the input field at the bottom of any list. Each task can have a title, description, priority level (low, medium, high, urgent), due date, and status. Click a task to open its detail view where you can edit everything, add subtasks, and assign tags.',
    tip: 'Pin your most important tasks to keep them at the top of the list, regardless of sorting.',
  },
  {
    id: 'using-lists',
    title: 'Using Lists',
    content: 'Lists are your primary organizational tool. Create multiple lists for different areas of your life — work, personal, shopping, projects. Each list gets its own color and icon. Drag and drop to reorder lists in the sidebar. Archive lists you\'re done with to keep your workspace clean.',
    tip: 'Use emoji icons for lists to make them instantly recognizable in the sidebar.',
  },
  {
    id: 'views',
    title: 'Views',
    content: 'Switch between three views for any list: List View shows tasks in a traditional checklist format. Kanban Board organizes tasks into columns by status (Pending, In Progress, Completed). Calendar View displays tasks on a monthly calendar based on their due dates. Drag tasks between columns or dates to update them.',
    tip: 'Use Kanban view for project management and Calendar view for deadline-heavy tasks.',
  },
  {
    id: 'tags-filters',
    title: 'Tags & Filters',
    content: 'Create custom tags with colors to categorize tasks across lists. Assign multiple tags to any task. Use the filter bar at the top of each list to filter by status, priority, or tags. Sort tasks by position, due date, priority, or creation date.',
    tip: 'Create tags like "urgent", "waiting", or "delegated" to add context beyond priority levels.',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    content: 'SupaTodo is built for speed. Press Cmd/Ctrl + K to instantly search across all your todos and lists. Press Cmd/Ctrl + N to quickly add a task from anywhere in the app — just type, pick a list, set priority, and hit enter.',
    tip: 'The search supports operators like "priority:high" and "status:completed" for power users.',
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    content: 'Our AI assistant helps you work smarter. It can break down complex tasks into manageable subtasks, suggest appropriate priority levels based on context, and understand natural language input. Type something like "Buy groceries tomorrow at 5pm" and the AI will parse the due date automatically.',
    tip: 'The more descriptive your task titles, the better AI suggestions you\'ll get.',
  },
  {
    id: 'offline-mode',
    title: 'Offline Mode',
    content: 'SupaTodo works even without an internet connection. Changes you make offline are queued and automatically synced when you come back online. You\'ll see an indicator when you\'re offline and a confirmation when changes sync successfully.',
    tip: 'Offline mode is perfect for adding tasks on the go — on the subway, on a plane, or in areas with poor connectivity.',
  },
  {
    id: 'export-import',
    title: 'Export & Import',
    content: 'Go to Settings to export all your data as a JSON file — lists, todos, subtasks, tags, everything. Import data from a backup file with options to merge with existing data or replace it entirely. You can even import data from another SupaTodo account.',
    tip: 'Set a monthly reminder to export your data as a backup. It only takes one click.',
  },
  {
    id: 'settings',
    title: 'Settings',
    content: 'Customize SupaTodo in Settings: change your display name and avatar, update your password, switch between light/dark/auto themes, adjust layout density (compact, comfortable, spacious), and manage your data exports.',
    tip: 'Try "Auto" theme to match your system settings — dark at night, light during the day.',
  },
];

export default function GuidePage() {
  const [active, setActive] = useState(guides[0].id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How to Use SupaTodo</h1>
      <p className="mt-3 text-base text-gray-600">
        A complete guide to getting the most out of your free productivity app.
      </p>

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Mobile dropdown TOC */}
        <div className="lg:hidden">
          <select value={active} onChange={(e) => setActive(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
            {guides.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>

        {/* Desktop sticky sidebar */}
        <nav className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            {guides.map((g) => (
              <button key={g.id} onClick={() => setActive(g.id)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  active === g.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {g.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {guides.filter((g) => g.id === active).map((g) => (
            <div key={g.id}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{g.title}</h2>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">{g.content}</p>
              <div className="mt-6 rounded-xl bg-indigo-50 border-l-4 border-indigo-500 p-4">
                <p className="text-sm text-indigo-800">
                  <span className="font-semibold">Pro tip:</span> {g.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
