"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, GraduationCap } from "lucide-react";

export default function ConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const hash = window.location.hash;

      if (!hash.includes("access_token")) {
        router.replace("/auth/login");
        return;
      }

      const hashParams   = new URLSearchParams(hash.substring(1));
      const accessToken  = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? "";

      if (!accessToken) {
        router.replace("/auth/login");
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: sessionError } = await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError("This link has expired or is invalid. Please try again.");
        return;
      }

      try {
        const res  = await fetch("/api/auth/finalize", { method: "POST" });
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
        router.replace(json.destination ?? "/auth/login");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    })();
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
