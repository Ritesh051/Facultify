"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/dashboards/PageHeader";
import { useAppStore } from "@/store/app-store";

export default function AdminSettingsPage() {
  const { activeSession } = useAppStore();
  const inst = activeSession?.role === "admin" ? activeSession.user : null;

  const [name, setName] = useState(inst?.name ?? "");
  const [domain, setDomain] = useState(inst?.domain ?? "");
  const [email, setEmail] = useState(inst?.adminEmail ?? "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your institution settings" />

      <div className="max-w-2xl space-y-6">
        {/* Institution Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Institution Details</CardTitle>
            <CardDescription>Update your institution&apos;s public information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Institution Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Admin Contact Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={() => toast.success("Settings saved successfully!")}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts for important events</p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Summary Report</p>
                <p className="text-xs text-muted-foreground">Get a weekly digest of institution activity</p>
              </div>
              <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
              <div>
                <p className="text-sm font-medium text-red-800">Delete Institution</p>
                <p className="text-xs text-red-600">This will permanently delete all data. Cannot be undone.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => toast.error("Please contact support to delete your institution.")}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
