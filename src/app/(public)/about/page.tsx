import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — todoMasterAI",
  description: "Learn about todoMasterAI, the free AI-powered todo app built for everyone.",
};

const values = [
  {
    icon: "\uD83D\uDD12",
    title: "Privacy First",
    desc: "Your data belongs to you. We never sell, share, or monetize it.",
  },
  {
    icon: "\uD83D\uDCB0",
    title: "Always Free",
    desc: "Every feature, for every user, forever. No premium tier. No catch.",
  },
  {
    icon: "\uD83C\uDF0D",
    title: "Community Driven",
    desc: "Built in the open, shaped by user feedback, improved every week.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">About todoMasterAI</h1>

      <div className="mt-8 space-y-6 text-base text-gray-600 leading-relaxed">
        <p>
          We built todoMasterAI because we were tired of todo apps that charge $10/month for basic
          features. Productivity tools should be free, simple, and respect your privacy.
        </p>
        <p>
          What started as a weekend side project quickly grew into a full-featured productivity app
          with AI-powered task management, multiple views, offline support, and complete data
          portability.
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-indigo-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900">Our Mission</h2>
        <p className="mt-3 text-base text-gray-600">
          To build the best free productivity tool on the internet. No ads. No data selling. No
          premium upsells. Just a great app that helps you get things done.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Our Values</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-gray-200 bg-white p-5">
              <span className="text-2xl">{v.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{v.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900">The Team</h2>
        <p className="mt-3 text-base text-gray-600">
          Built by a small team of passionate developers who believe great software should be
          accessible to everyone. We don&apos;t have investors to please or quarterly targets to hit
          &mdash; just a commitment to building the best free todo app possible.
        </p>
      </div>
    </div>
  );
}
