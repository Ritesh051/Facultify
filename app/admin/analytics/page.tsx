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
import { getAdminAnalytics, getTeacherAnalytics } from "@/lib/mock-service";
import { TEACHERS, STUDENTS, TEACHER_ANALYTICS } from "@/lib/mock-data";
import { Users, GraduationCap, FileText, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminAnalytics, TeacherAnalytics } from "@/lib/types";

// ─── Static chart data ────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: "Jan", tests: 12, submissions: 180 },
  { month: "Feb", tests: 18, submissions: 240 },
  { month: "Mar", tests: 15, submissions: 210 },
  { month: "Apr", tests: 22, submissions: 290 },
  { month: "May", tests: 27, submissions: 380 },
  { month: "Jun", tests: 19, submissions: 260 },
];

const SUBJECT_PIE = [
  { name: "Mathematics", value: 35, color: "#3b82f6" },
  { name: "Physics",     value: 22, color: "#8b5cf6" },
  { name: "Chemistry",   value: 18, color: "#10b981" },
  { name: "English",     value: 25, color: "#f59e0b" },
];

// Deterministic per-teacher avg scores keyed by teacher id — no Math.random()
const TEACHER_SCORES: Record<string, number> = {
  teacher_01: 79,
  teacher_02: 74,
  teacher_03: 68,
  teacher_04: 83,
};

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
    activeSession?.role === "admin" ? activeSession.user.id : "inst_01";

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [teacherAnalytics, setTeacherAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getAdminAnalytics(institutionId),
      getTeacherAnalytics("teacher_01"),
    ]).then(([adminData, teacherData]) => {
      if (!cancelled) {
        setAnalytics(adminData);
        setTeacherAnalytics(teacherData);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [institutionId]);

  // Deterministic teacher performance — no Math.random()
  const teacherPerformance = useMemo(
    () =>
      TEACHERS.map((t) => ({
        name: t.name.split(" ").slice(-1)[0], // last name only — fits chart axis
        fullName: t.name,
        subject: t.subject,
        avgScore: TEACHER_SCORES[t.id] ?? 75,
        students: t.studentCount,
      })),
    []
  );

  const topStudents = useMemo(
    () =>
      [...STUDENTS]
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 5),
    []
  );

  // Chart data from TEACHER_ANALYTICS (as required)
  const recentScores = TEACHER_ANALYTICS.recentTestScores;

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
            trend={{ value: 8, label: "vs last month" }}
          />
          <StatsCard
            title="Active Teachers"
            value={analytics?.activeTeachers ?? "—"}
            subtitle={`of ${analytics?.totalTeachers ?? "—"} total`}
            icon={Users}
            color="blue"
            trend={{ value: 12, label: "vs last month" }}
          />
          <StatsCard
            title="Tests This Month"
            value={analytics?.testsThisMonth ?? "—"}
            subtitle={`${analytics?.totalTestsCreated ?? "—"} all time`}
            icon={FileText}
            color="purple"
            trend={{ value: 3, label: "vs last month" }}
          />
          <StatsCard
            title="Avg Score"
            value={analytics ? `${analytics.avgInstitutionScore}%` : "—"}
            subtitle="institution-wide"
            icon={TrendingUp}
            color="orange"
            trend={{ value: 5, label: "vs last month" }}
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
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={MONTHLY_DATA}
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

        {/* Teacher Performance — BarChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Teacher Performance
            </CardTitle>
            <CardDescription>Average class score by teacher</CardDescription>
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
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} maxBarSize={52}>
                    {teacherPerformance.map((entry) => (
                      <Cell
                        key={entry.fullName}
                        fill={
                          entry.avgScore >= 80
                            ? "#7c3aed"
                            : entry.avgScore >= 70
                            ? "#8b5cf6"
                            : entry.avgScore >= 60
                            ? "#a78bfa"
                            : "#c4b5fd"
                        }
                      />
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
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={SUBJECT_PIE}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {SUBJECT_PIE.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-2 space-y-1.5">
                  {SUBJECT_PIE.map((s) => (
                    <li key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-slate-600">{s.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{s.value}%</span>
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
                    <TableHead className="hidden md:table-cell text-right">Tests</TableHead>
                    <TableHead className="min-w-[140px]">Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStudents.map((s, i) => (
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
                        {s.rollNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right text-sm text-muted-foreground py-3">
                        {s.testsAttempted}
                      </TableCell>
                      <TableCell className="py-3 pr-6">
                        <ScoreBar score={s.overallScore} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent test scores from TEACHER_ANALYTICS ── */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Recent Test Scores — Mathematics
            </CardTitle>
            <CardDescription>
              Last {recentScores.length} tests by Dr. Ananya Sharma · avg class score per test
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton height={180} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={recentScores}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="testTitle"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [`${v}%`, "Avg Score"]}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={56}>
                    {recentScores.map((entry) => (
                      <Cell
                        key={entry.testTitle}
                        fill={
                          entry.avgScore >= 80
                            ? "#2563eb"
                            : entry.avgScore >= 70
                            ? "#3b82f6"
                            : "#60a5fa"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
