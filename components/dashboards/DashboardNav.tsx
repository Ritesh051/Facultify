"use client";

import { BookOpen, Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const roleConfig: Record<
  UserRole,
  { label: string; color: string; route: string }
> = {
  admin: {
    label: "Institution Admin",
    color: "bg-blue-500 hover:bg-blue-500 text-white",
    route: "/admin",
  },
  teacher: {
    label: "Teacher",
    color: "bg-green-500 hover:bg-green-500 text-white",
    route: "/teacher",
  },
  student: {
    label: "Student",
    color: "bg-orange-500 hover:bg-orange-500 text-white",
    route: "/student",
  },
};

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function DashboardNav() {
  const router = useRouter();
  const { activeRole: role, setRole, activeSession: session } = useAppStore();

  const currentRoleConfig = roleConfig[role];
  const userName =
    session?.role === "admin"
      ? (session.user as { adminName: string }).adminName
      : session?.user?.name;

  function handleRoleChange(newRole: UserRole) {
    setRole(newRole);
    router.push(roleConfig[newRole].route);
  }

  return (
    <header className="w-full h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-400" />
        <span className="text-xl font-bold tracking-tight">Facultify</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* DEV Role Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 text-xs border border-slate-700"
            >
              <span className="text-slate-400 mr-1">[DEV]</span>
              Switch Role
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Dashboard Role
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleRoleChange("admin")}
              className={role === "admin" ? "bg-blue-50 text-blue-700 font-medium" : ""}
            >
              Institution Admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange("teacher")}
              className={role === "teacher" ? "bg-green-50 text-green-700 font-medium" : ""}
            >
              Teacher
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange("student")}
              className={role === "student" ? "bg-orange-50 text-orange-700 font-medium" : ""}
            >
              Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Current Role Badge */}
        <Badge className={currentRoleConfig.color}>
          {currentRoleConfig.label}
        </Badge>

        {/* Notifications Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:text-white hover:bg-slate-800 relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Unread indicator dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* User Avatar */}
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-slate-700 hover:ring-blue-400 transition-all">
          <AvatarFallback className="bg-slate-700 text-slate-200 text-sm font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
