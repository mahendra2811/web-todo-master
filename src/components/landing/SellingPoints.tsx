const points = [
  {
    icon: '\uD83D\uDCB0',
    title: '100% Free. Really.',
    desc: "No premium tier. No paywalls. No 'free trial' tricks. Every feature is available to everyone. We built this because productivity shouldn't cost money.",
  },
  {
    icon: '\uD83E\uDD16',
    title: 'AI That Actually Helps',
    desc: "Smart task breakdown, priority suggestions, and natural language input. Just type 'Buy groceries tomorrow at 5pm' and watch the magic.",
  },
  {
    icon: '\uD83D\uDD12',
    title: 'Your Data, Your Control',
    desc: 'Export everything as JSON anytime. Import it back. Works offline. Your data never gets sold or used for ads. Period.',
  },
];

export function SellingPoints() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="fade-in-up rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
              <span className="text-3xl sm:text-4xl">{p.icon}</span>
              <h3 className="mt-4 text-base sm:text-lg font-bold text-gray-900">{p.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
