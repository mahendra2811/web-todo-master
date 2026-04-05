'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthModalStore } from '@/stores/auth-modal-store';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openLogin, openSignup } = useAuthModalStore();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <span className="text-xl">&#9989;</span> SupaTodo
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={openLogin}
              className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] items-center">
              Sign In
            </button>
            <button onClick={openSignup}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors min-h-[44px]">
              Get Started Free
            </button>
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center">
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg">
                {l.label}
              </Link>
            ))}
            <button onClick={() => { openLogin(); setMenuOpen(false); }}
              className="block w-full text-left px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
