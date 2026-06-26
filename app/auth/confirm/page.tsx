"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, GraduationCap } from "lucide-react";

export default function ConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // Only run when there's a hash token — direct navigation gets sent to login.
    if (!window.location.hash.includes("access_token")) {
      router.replace("/auth/login");
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // createBrowserClient auto-detects #access_token in the hash and calls
    // setSession internally. onAuthStateChange fires with SIGNED_IN when done.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // SIGNED_IN fires for new sign-ins; INITIAL_SESSION fires when subscribing
        // to a client that already processed the hash token before this effect ran.
        if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return;
        if (!session) return;
        try {
          const res = await fetch("/api/auth/finalize", { method: "POST" });
          const json = await res.json();
          if (json.error) { setError(json.error); return; }
          router.replace(json.destination ?? "/auth/login");
        } catch {
          setError("Something went wrong. Please try again.");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <a href="/auth/login" className="text-sm text-blue-600 underline">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
        <GraduationCap className="h-5 w-5 text-white" />
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Setting up your account…
      </div>
    </div>
  );
}
