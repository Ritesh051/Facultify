"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ShieldCheck, BookOpen } from "lucide-react";

type UserRole = "admin" | "teacher" | "student";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  items: NavItem[];
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  admin: { label: "Admin", Icon: ShieldCheck },
  teacher: { label: "Teacher", Icon: BookOpen },
  student: { label: "Student", Icon: GraduationCap },
};

export default function DashboardSidebar({ items, role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { label, Icon } = roleConfig[role];

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-900 text-slate-300 shrink-0">
      {/* Role header */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700">
        <Icon className="w-6 h-6 text-blue-400 shrink-0" />
        <span className="text-lg font-semibold text-white tracking-wide">{label}</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {items.map(({ label: itemLabel, href, icon: ItemIcon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded transition-colors duration-150 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ItemIcon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{itemLabel}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
