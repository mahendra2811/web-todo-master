'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { passwordChangeSchema } from '@/lib/validators/auth';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 8 ? 2 : /(?=.*[A-Z])(?=.*\d)/.test(newPassword) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength];
  const strengthTextColor = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][strength];
  const strengthWidth = ['0%', '25%', '50%', '75%', '100%'][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = passwordChangeSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative bg */}
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
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 p-6 sm:p-8">
          <div className="mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Set new password</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Min 6 characters"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: strengthWidth }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strengthTextColor}`}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
                placeholder="Re-enter your password"
                required
              />
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs mt-1 text-red-500 font-medium">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
