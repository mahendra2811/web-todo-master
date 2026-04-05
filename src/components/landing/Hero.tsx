"use client";

import { useAuthModalStore } from "@/stores/auth-modal-store";

export function Hero() {
  const { openSignup } = useAuthModalStore();

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
      {/* Decorative bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-100 opacity-30 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-4 w-4 rounded-full bg-indigo-300 opacity-60" />
        <div className="absolute top-60 left-1/3 h-3 w-3 rounded-full bg-purple-300 opacity-50" />
        <div className="absolute bottom-32 left-1/4 h-5 w-5 rounded-full bg-indigo-200 opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            Your Tasks. <span className="text-indigo-600">Organized.</span>{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Free Forever.
            </span>
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            The AI-powered todo app that&apos;s 100% free. No ads. No credit card. No catch. Just
            pure productivity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openSignup}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 min-h-[44px]"
            >
              Start for Free &rarr;
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center min-h-[44px]"
            >
              See How It Works &darr;
            </a>
          </div>
        </div>

        {/* Fake app mockup */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-200/50">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">todoMasterAI</span>
            </div>
            {[
              { text: "Launch new website", done: true, priority: "high" },
              { text: "Review design mockups", done: false, priority: "medium" },
              { text: "Write API documentation", done: false, priority: "low" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-1">
                <span
                  className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${item.done ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                >
                  {item.done && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm flex-1 ${item.done ? "line-through text-gray-400" : "text-gray-900"}`}
                >
                  {item.text}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    item.priority === "high"
                      ? "bg-red-50 text-red-600"
                      : item.priority === "medium"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 sm:mt-12 flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1.5">&#128274; No credit card</span>
          <span className="flex items-center gap-1.5">&#128683; No ads ever</span>
          <span className="flex items-center gap-1.5">&#129302; AI built-in</span>
          <span className="flex items-center gap-1.5">&#128241; Works offline</span>
        </div>
      </div>
    </section>
  );
}
