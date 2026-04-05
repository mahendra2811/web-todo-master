const stats = [
  { value: "100+", label: "Features" },
  { value: "Zero", label: "Cost" },
  { value: "< 1s", label: "Load Time" },
  { value: "\u2713", label: "Offline Ready" },
];

export function SocialProof() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Built by developers, for everyone
        </h2>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="fade-in-up rounded-xl bg-indigo-50 p-5 sm:p-6">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{s.value}</p>
              <p className="mt-1 text-sm text-gray-600 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          todoMasterAI is open-source and community-driven. No venture capital. No investors to
          please. Just a great todo app.
        </p>
      </div>
    </section>
  );
}
