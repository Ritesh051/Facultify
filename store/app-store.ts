"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, Institution, Teacher, Student, ActiveSession } from "@/lib/types";
import { INSTITUTIONS, TEACHERS, STUDENTS } from "@/lib/mock-data";

interface AppState {
  activeRole: UserRole;
  activeSession: ActiveSession | null;
  setRole: (role: UserRole) => void;
  resetSession: () => void;
}

function buildSession(role: UserRole): ActiveSession {
  const institution = INSTITUTIONS[0];
  const teacher = TEACHERS[0];
  const student = STUDENTS[0];

  if (role === "admin") {
    return {
      role: "admin",
      user: { ...institution, adminName: "Dr. Ramesh Gupta" },
    };
  }
  if (role === "teacher") {
    return {
      role: "teacher",
      user: teacher,
      institution,
    };
  }
  return {
    role: "student",
    user: student,
    institution,
    teacher,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeRole: "admin",
      activeSession: buildSession("admin"),
      setRole: (role: UserRole) =>
        set({ activeRole: role, activeSession: buildSession(role) }),
      resetSession: () =>
        set({ activeRole: "admin", activeSession: buildSession("admin") }),
    }),
    {
      name: "facultify-session",
      partialize: (state) => ({ activeRole: state.activeRole }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.activeSession = buildSession(state.activeRole);
        }
      },
    }
  )
);
