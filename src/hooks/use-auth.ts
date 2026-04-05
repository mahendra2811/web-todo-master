"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginInput, SignupInput } from "@/lib/validators/auth";

export function useAuth() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const supabase = createClient();

  const signIn = useCallback(
    async ({ email, password }: LoginInput) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    },
    [supabase, router]
  );

  const signUp = useCallback(
    async ({ email, password, fullName }: SignupInput) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      return { message: "Check your email for a confirmation link." };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [supabase, router]);

  return { user, loading, signIn, signUp, signOut };
}
