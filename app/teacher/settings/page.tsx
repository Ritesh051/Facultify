"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageHeader from "@/components/dashboards/PageHeader";
import { useAppStore } from "@/store/app-store";
import { createClient } from "@/lib/supabase/client";

export default function TeacherSettingsPage() {
  const { activeSession } = useAppStore();
  const teacher = activeSession?.role === "teacher" ? activeSession.user : null;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setPassword("");
    setConfirm("");
    toast.success("Password set — you can now log in with your email and password, or continue using a magic link.");
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No teacher session found.
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage how you sign in to Facultify" />

      <div className="max-w-2xl space-y-6">
        {/* Login email — shared by both password and magic-link sign-in */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" /> Login Email
            </CardTitle>
            <CardDescription>
              This is the email you sign in with — for a password, a magic link, or both.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input value={teacher.email} disabled className="bg-slate-50" />
          </CardContent>
        </Card>

        {/* Set / update password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-500" /> Password
            </CardTitle>
            <CardDescription>
              Set a password so you can sign in directly, instead of requesting a magic link every time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" /> Save password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
