"use client";

import DashboardNav from "@/components/dashboards/DashboardNav";
import DashboardSidebar from "@/components/dashboards/DashboardSidebar";
import { LayoutDashboard, Users, FileText, PlusCircle, Sparkles, CheckSquare } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "My Students", href: "/teacher/students", icon: Users },
  { label: "My Tests", href: "/teacher/tests", icon: FileText },
  { label: "Create Test", href: "/teacher/create-test", icon: PlusCircle },
  { label: "AI Generator", href: "/teacher/ai-generator", icon: Sparkles },
  { label: "Grading Center", href: "/teacher/checking", icon: CheckSquare },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <DashboardNav />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar items={NAV_ITEMS} role="teacher" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
