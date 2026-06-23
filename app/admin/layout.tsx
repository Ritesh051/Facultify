"use client";

import DashboardNav from "@/components/dashboards/DashboardNav";
import DashboardSidebar from "@/components/dashboards/DashboardSidebar";
import { LayoutDashboard, Users, BarChart3, CreditCard, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Teachers", href: "/admin/teachers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <DashboardNav />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar items={NAV_ITEMS} role="admin" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
