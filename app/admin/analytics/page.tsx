"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/dashboards/PageHeader";
import StatsCard from "@/components/dashboards/StatsCard";
import { useAppStore } from "@/store/app-store";
import { getAdminAnalytics, getTeachers } from "@/lib/supabase-service";
import { createBrowserClient } from "@supabase/ssr";
import { Users, GraduationCap, FileText, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminAnalytics, Teacher } from "@/lib/types";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f97316"];

interface SubjectSlice { name: string; value: number; count: number; color: string }
interface MonthlyEntry { month: string; tests: number; submissions: number }
interface TopStudent { id: string; name: string; email: string; roll_number: string; overall_score: number }

function buildMonthlyData(
  rawTests: { created_at: string }[],
  rawSubs: { submitted_at: string | null }[]
): MonthlyEntry[] {
  const buckets: { label: string; year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    buckets.push({ label: d.toLocaleDateString("en-IN", { month: "short" }), year: d.getFullYear(), month: d.getMonth() });
  }
  return buckets.map(({ label, year, month }) => ({
    month: label,
    tests: rawTests.filter(t => { const d = new Date(t.created_at); return d.getFullYear() === year && d.getMonth() === month; }).length,
    submissions: rawSubs.filter(s => { if (!s.submitted_at) return false; const d = new Date(s.submitted_at); return d.getFullYear() === year && d.getMonth() === month; }).length,
  }));
}

function buildSubjectPie(rawTests: { subject: string }[]): SubjectSlice[] {
  const counts: Record<string, number> = {};
  for (const t of rawTests) counts[t.subject] = (counts[t.subject] ?? 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count], i) => ({ name, count, value: Math.round((count / total) * 100), color: PIE_COLORS[i % PIE_COLORS.length] }));
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      aria-hidden="true"
    />
  );
}

function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}

// ─── Custom tooltips ──────────────────────────────────────────────────────────

interface LineTooltipPayload {
  value: number;
  name: string;
  color: string;
}

function LineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: LineTooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs space-y-1">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { name: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const { value, payload: item } = payload[0];
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{item.name}</p>
      <p className="text-purple-600 font-bold">{value}% avg class score</p>
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700">{name}</p>
      <p className="text-slate-500 mt-0.5">{value}% of tests</p>
    </div>
  );
}

// ─── Score bar used inside top students table ─────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const colorClass =
    score >= 80
      ? "bg-green-500"
      : score >= 65
      ? "bg-blue-500"
      : "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={cn(
          "font-bold text-sm tabular-nums w-9 text-right",
          score >= 80
            ? "text-green-600"
            : score >= 65
            ? "text-blue-600"
            : "text-amber-600"
        )}
      >
        {score}%
      </span>
    </div>
  );
}

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) {
    return <span className="text-base">{medals[rank]}</span>;
  }
  return (
    <span className="text-sm font-medium text-slate-400 tabular-nums w-5 text-center">
      {rank}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { activeSession } = useAppStore();
  const institutionId =
    activeSession?.role === "admin" ? activeSession.user.id : "";

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>([]);
  const [subjectPie, setSubjectPie] = useState<SubjectSlice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    let cancelled = false;
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    const since = sixMonthsAgo.toISOString();

    Promise.all([
      getAdminAnalytics(institutionId),
      getTeachers(institutionId),
      // Top students by overall score
      supabase
        .from("students")
        .select("id, name, email, roll_number, overall_score")
        .eq("institution_id", institutionId)
        .eq("is_active", true)
        .order("overall_score", { ascending: false })
        .limit(5),
      // Tests in last 6 months (for monthly line chart + subject pie)
      supabase
        .from("tests")
        .select("created_at, subject")
        .eq("institution_id", institutionId)
        .gte("created_at", since),
      // Submissions in last 6 months (joined through tests for institution filter)
      supabase
        .from("submissions")
        .select("submitted_at, tests!inner(institution_id)")
        .eq("tests.institution_id", institutionId)
        .gte("submitted_at", since)
        .not("submitted_at", "is", null)
        .in("status", ["submitted", "graded"]),
      // All tests (for subject pie — not limited to 6 months)
      supabase
        .from("tests")
        .select("subject")
        .eq("institution_id", institutionId),
    ]).then(([adminData, teacherData, { data: studentsData }, { data: recentTests }, { data: recentSubs }, { data: allTests }]) => {
      if (cancelled) return;
      setAnalytics(adminData);
      setTeachers(teacherData);
      setTopStudents((studentsData ?? []) as TopStudent[]);
      setMonthlyData(buildMonthlyData(recentTests ?? [], recentSubs ?? []));
      setSubjectPie(buildSubjectPie(allTests ?? []));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [institutionId]);

  const teacherPerformance = useMemo(
    () =>
      teachers.map((t) => ({
        name: t.name.split(" ").slice(-1)[0],
        fullName: t.name,
        subject: t.subject,
        tests: t.testCount,
        students: t.studentCount,
      })),
    [teachers]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Institution Analytics"
        subtitle="Comprehensive overview of performance metrics across all teachers and students"
      />

      {/* ── Metric cards ── */}
      {loading ? (
        <StatsRowSkeleton />
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={analytics?.totalStudents ?? "—"}
            subtitle={`${analytics?.activeStudents ?? "—"} active`}
            icon={GraduationCap}
            color="green"
          />
          <StatsCard
            title="Active Teachers"
            value={analytics?.activeTeachers ?? "—"}
            subtitle={`of ${analytics?.totalTeachers ?? "—"} total`}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Tests This Month"
            value={analytics?.testsThisMonth ?? "—"}
            subtitle={`${analytics?.totalTestsCreated ?? "—"} all time`}
            icon={FileText}
            color="purple"
          />
          <StatsCard
            title="Avg Score"
            value={analytics ? `${analytics.avgInstitutionScore}%` : "—"}
            subtitle="institution-wide"
            icon={TrendingUp}
            color="orange"
          />
        </div>
      )}

      {/* ── Line + Bar charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Test Activity — LineChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Monthly Test Activity
            </CardTitle>
            <CardDescription>Tests created and submissions over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={220} />
            ) : monthlyData.every(m => m.tests === 0 && m.submissions === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-16">No test activity in the last 6 months.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<LineTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Line
                    type="monotone"
                    dataKey="tests"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    name="Tests Created"
                  />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    name="Submissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Teacher Activity — BarChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Teacher Activity
            </CardTitle>
            <CardDescription>Tests created per teacher</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={teacherPerformance}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="tests" radius={[4, 4, 0, 0]} maxBarSize={52}>
                    {teacherPerformance.map((entry) => (
                      <Cell key={entry.fullName} fill="#7c3aed" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Pie chart + Top Students table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests by Subject — PieChart (donut) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Tests by Subject
            </CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={200} />
            ) : subjectPie.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">No tests created yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={subjectPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {subjectPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-2 space-y-1.5">
                  {subjectPie.map((s) => (
                    <li key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-slate-600">{s.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{s.count} test{s.count !== 1 ? "s" : ""}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Students */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Top Performing Students
            </CardTitle>
            <CardDescription>Ranked by overall score across all tests</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Roll No.</TableHead>
                    <TableHead className="min-w-[140px]">Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                        No students enrolled yet.
                      </TableCell>
                    </TableRow>
                  ) : topStudents.map((s, i) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/60">
                      <TableCell className="py-3">
                        <RankBadge rank={i + 1} />
                      </TableCell>
                      <TableCell className="py-3">
                        <div>
                          <p className="font-medium text-sm text-slate-800 leading-tight">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {s.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-slate-500 py-3">
                        {s.roll_number}
                      </TableCell>
                      <TableCell className="py-3">
                        {s.overall_score > 0
                          ? <ScoreBar score={s.overall_score} />
                          : <span className="text-xs text-muted-foreground">No tests yet</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
