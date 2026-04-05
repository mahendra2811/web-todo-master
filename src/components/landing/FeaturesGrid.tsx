const features = [
  { icon: '\uD83D\uDCCB', title: 'Smart Lists', desc: 'Organize tasks into color-coded lists with custom icons' },
  { icon: '\uD83D\uDCCA', title: 'Multiple Views', desc: 'Switch between list, kanban board, and calendar views' },
  { icon: '\uD83C\uDFF7\uFE0F', title: 'Tags & Filters', desc: 'Tag, filter, and sort your way to zero inbox' },
  { icon: '\u26A1', title: 'Quick Add', desc: 'Cmd+N to add a task from anywhere in the app' },
  { icon: '\uD83D\uDCF1', title: 'Works Offline', desc: "No internet? No problem. Syncs when you're back online" },
  { icon: '\uD83D\uDD04', title: 'Export & Import', desc: 'Download all your data as JSON. Import it anywhere' },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
            Built for people who want to get things done, not manage a tool.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f) => (
            <div key={f.title} className="fade-in-up rounded-xl border border-gray-200 bg-white p-4 sm:p-6 hover:shadow-md hover:border-gray-300 transition-all">
              <span className="text-2xl sm:text-3xl">{f.icon}</span>
              <h3 className="mt-3 text-sm sm:text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
