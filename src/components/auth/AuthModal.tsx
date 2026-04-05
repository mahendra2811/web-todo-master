"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthModalStore } from "@/stores/auth-modal-store";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, signupSchema } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AuthModal() {
  const { open, view, setView, close } = useAuthModalStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
    >
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-white p-5 sm:p-6 shadow-lg sm:max-w-md sm:mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {view === "login" && "Welcome back"}
            {view === "signup" && "Create your free account"}
            {view === "forgot" && "Reset your password"}
          </h2>
          <button
            onClick={close}
            className="p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {view === "login" && <LoginView onSwitch={setView} onClose={close} />}
        {view === "signup" && <SignupView onSwitch={setView} />}
        {view === "forgot" && <ForgotView onSwitch={setView} />}
      </div>
    </div>
  );
}

function LoginView({
  onSwitch,
  onClose,
}: {
  onSwitch: (v: "signup" | "forgot") => void;
  onClose: () => void;
}) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await signIn(result.data);
      toast.success("Welcome back!");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSwitch("forgot")}
          className="mt-1 text-xs text-indigo-600 hover:text-indigo-700"
        >
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">or</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          const supabase = createClient();
          supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/dashboard` },
          });
        }}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] flex items-center justify-center gap-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </button>
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("signup")}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

function SignupView({ onSwitch }: { onSwitch: (v: "login") => void }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const strength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : 3;
  const strengthColor = ["bg-gray-200", "bg-red-400", "bg-yellow-400", "bg-green-400"][strength];
  const strengthWidth = ["0%", "33%", "66%", "100%"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = signupSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await signUp(result.data);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="John Doe"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="Min 6 characters"
          required
        />
        {password.length > 0 && (
          <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${strengthColor}`}
              style={{ width: strengthWidth }}
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

function ForgotView({ onSwitch }: { onSwitch: (v: "login") => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">📧</div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Check your email!</h3>
        <p className="text-sm text-gray-600 mb-4">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="you@example.com"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      <p className="text-center">
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Sign In
        </button>
      </p>
    </form>
  );
}
