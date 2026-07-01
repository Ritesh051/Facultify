"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { GraduationCap, Loader2 } from "lucide-react";

// Single entry point after any login or invite acceptance.
// Reads the user's role and routes them to the right dashboard.
export default function DashboardPage() {
  const router = useRouter();
  const { activeSession, sessionLoading, initSession } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSession().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || sessionLoading) return;
    if (!activeSession) { router.replace("/auth/login"); return; }
    console.log("activeSession.role", activeSession.role);

    if (activeSession.role === "admin")   { router.replace("/admin"); return; }
    if (activeSession.role === "teacher") { router.replace("/teacher"); return; }
    if (activeSession.role === "student") { router.replace("/student"); return; }
    router.replace("/auth/login");
  }, [ready, sessionLoading, activeSession, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
        <GraduationCap className="h-5 w-5 text-white" />
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your dashboard…
      </div>
    </div>
  );
}
