"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /teacher/[id] is the invite landing URL — redirect to /teacher (the actual dashboard).
// The teacher layout above already verifies the session is a valid teacher.
export default function TeacherPersonalPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/teacher"); }, [router]);
  return null;
}
