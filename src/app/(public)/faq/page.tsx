"use client";

import { useState } from "react";
import type { Metadata } from "next";

const faqs = [
  {
    q: "Is todoMasterAI really free?",
    a: "Yes, 100% free. No premium tier, no ads, no credit card required. Every feature is available to every user.",
  },
  {
    q: "How do you make money?",
    a: "We don't. todoMasterAI is a passion project built by developers who believe productivity tools should be free and accessible to everyone.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We use Supabase with row-level security. Your data is encrypted in transit and at rest, and only accessible by you.",
  },
  {
    q: "Can I export my data?",
    a: 'Yes. Go to Settings and click "Export All Data" to download everything as a JSON file. You can import it back anytime.',
  },
  {
    q: "Does it work offline?",
    a: "Yes. todoMasterAI works offline and automatically syncs your changes when you're back online.",
  },
  {
    q: "What AI features are available?",
    a: 'Smart task breakdown, priority suggestions, natural language input (e.g., "Buy milk tomorrow at 5pm"), and more AI features coming soon.',
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes. todoMasterAI is fully responsive and designed mobile-first. It works great on phones, tablets, and desktops.",
  },
  {
    q: "How do I report a bug?",
    a: 'Use the Contact page and select "Bug Report" as the subject, or go to the Feedback page to share details about the issue.',
  },
  {
    q: "Can I collaborate with others?",
    a: "Shared lists and real-time collaboration features are coming soon. Stay tuned!",
  },
  {
    q: "How do I delete my account?",
    a: "Contact us at support@todoMasterAI.app and we'll delete all your data within 24 hours. No questions asked.",
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-base text-gray-600">Quick answers to the most common questions.</p>

      <div className="mt-8 space-y-2">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[44px]"
              >
                <span className="text-sm sm:text-base font-medium text-gray-900 pr-4">{faq.q}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-48" : "max-h-0"}`}
              >
                <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
