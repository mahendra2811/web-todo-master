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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
    >
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-2xl sm:max-w-md sm:mx-4">
        <div className="flex items-center justify-between mb-1">
          <div />
          <button
            onClick={close}
            className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
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
        {view === "signup" && <SignupView onSwitch={setView} onClose={close} />}
        {view === "forgot" && <ForgotView onSwitch={setView} />}
      </div>
    </div>
  );
}

function GoogleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all min-h-[44px] flex items-center justify-center gap-3"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
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
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-gray-400 uppercase tracking-wider">or</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function handleGoogleAuth() {
  const supabase = createClient();
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
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
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to continue to your tasks</p>
      </div>

      <GoogleButton label="Continue with Google" onClick={handleGoogleAuth} />
      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <button
              type="button"
              onClick={() => onSwitch("forgot")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
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
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("signup")}
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Create one free
        </button>
      </p>
    </div>
  );
}

function SignupView({
  onSwitch,
  onClose,
}: {
  onSwitch: (v: "login") => void;
  onClose: () => void;
}) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 8
          ? 2
          : /(?=.*[A-Z])(?=.*\d)/.test(password)
            ? 4
            : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "bg-gray-200",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ][strength];
  const strengthTextColor = [
    "",
    "text-red-500",
    "text-orange-500",
    "text-yellow-600",
    "text-green-600",
  ][strength];
  const strengthWidth = ["0%", "25%", "50%", "75%", "100%"][strength];

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
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Create your free account</h2>
        <p className="text-sm text-gray-500 mt-1">Start organizing your tasks with AI</p>
      </div>

      <GoogleButton label="Continue with Google" onClick={handleGoogleAuth} />
      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
              placeholder="Min 6 characters"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
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
          {password.length > 0 && (
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
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
      <div className="text-center py-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-500">
          We sent a reset link to <strong className="text-gray-700">{email}</strong>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Didn&apos;t receive it? Check your spam folder.
        </p>
        <div className="mt-5 space-y-2">
          <button
            onClick={() => setSent(false)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Try another email
          </button>
          <button
            type="button"
            onClick={() => onSwitch("login")}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
          >
            Back to Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
          <svg
            className="h-6 w-6 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Reset your password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Sending...
            </span>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Remember your password?{" "}
        <button
          type="button"
          onClick={() => onSwitch("login")}
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
