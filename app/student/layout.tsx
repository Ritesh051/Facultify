"use client";

import DashboardNav from "@/components/dashboards/DashboardNav";
import DashboardSidebar from "@/components/dashboards/DashboardSidebar";
import { LayoutDashboard, FileText, BarChart3, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Tests", href: "/student/tests", icon: FileText },
  { label: "Performance", href: "/student/analytics", icon: BarChart3 },
  { label: "Profile", href: "/student/profile", icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <DashboardNav />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar items={NAV_ITEMS} role="student" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
