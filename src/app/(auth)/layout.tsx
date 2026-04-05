import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative bg matching homepage */}
      <div className="absolute inset-0 -z-10 bg-gray-50">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-100 opacity-30 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-4 w-4 rounded-full bg-indigo-300 opacity-60" />
        <div className="absolute top-60 left-1/3 h-3 w-3 rounded-full bg-purple-300 opacity-50" />
        <div className="absolute bottom-32 left-1/4 h-5 w-5 rounded-full bg-indigo-200 opacity-40" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
            <span className="text-2xl">&#9989;</span>
            <span>todo</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">MasterAI</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Your AI-powered productivity companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 p-6 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-indigo-500 hover:text-indigo-600">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-indigo-500 hover:text-indigo-600">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
