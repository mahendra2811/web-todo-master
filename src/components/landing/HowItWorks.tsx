const steps = [
  {
    num: 1,
    title: 'Sign up for free',
    desc: 'Just an email and password. No credit card, no phone number, no nonsense.',
  },
  {
    num: 2,
    title: 'Create your first list',
    desc: "Add a list, pick a color, and start adding tasks. It's that simple.",
  },
  {
    num: 3,
    title: 'Let AI do the heavy lifting',
    desc: 'Type naturally, and our AI breaks down complex tasks, suggests priorities, and keeps you on track.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Up and running in 60 seconds
          </h2>
        </div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 md:justify-between">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] border-t-2 border-dashed border-gray-300" />
          <div className="md:hidden absolute top-0 bottom-0 left-[22px] border-l-2 border-dashed border-gray-300" />

          {steps.map((s) => (
            <div key={s.num} className="fade-in-up relative flex md:flex-col items-start md:items-center gap-4 md:gap-3 md:flex-1 md:text-center z-10">
              <div className="flex-shrink-0 h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
                {s.num}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600 max-w-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
