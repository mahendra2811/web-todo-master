'use client';

import { useAuthModalStore } from '@/stores/auth-modal-store';

export function CTABanner() {
  const { openSignup } = useAuthModalStore();

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-indigo-600 px-6 py-12 sm:px-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to get organized?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-indigo-100 max-w-md mx-auto">
            Join thousands of productive people. It takes 10 seconds.
          </p>
          <button onClick={openSignup}
            className="mt-6 sm:mt-8 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg min-h-[44px]">
            Create Free Account &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
