import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";
import { cn } from "@/lib/utils";

const TAG_STYLES: Record<string, string> = {
  New: "bg-blue-50 text-blue-600",
  Improved: "bg-violet-50 text-violet-600",
  Fixed: "bg-emerald-50 text-emerald-600",
};

const ENTRIES = [
  {
    date: "January 2026",
    title: "Answer review mode for students",
    tags: ["New"],
    notes: [
      "Students can now open a read-only review of any declared result, showing their answer next to the correct one for every question.",
      "Written answers display teacher feedback alongside the student's submitted text.",
      "A finished test can no longer be re-entered and resubmitted from a stale tab.",
    ],
  },
  {
    date: "December 2025",
    title: "Teacher-controlled result declaration",
    tags: ["New"],
    notes: [
      "Teachers can now declare results for a whole test instantly with one click, or let them auto-reveal a configurable number of minutes after each student submits.",
      "Fixed a long-standing gap where fully auto-graded tests (all MCQ) never showed a result on the student's Completed tab.",
    ],
  },
  {
    date: "November 2025",
    title: "End-to-end test coverage",
    tags: ["Improved"],
    notes: [
      "Added automated browser tests covering the full teacher test-creation flow and the full student exam-taking flow.",
      "Added load testing for concurrent submissions to confirm grading stays accurate under simultaneous class-wide submits.",
    ],
  },
  {
    date: "October 2025",
    title: "Institution-wide analytics dashboard",
    tags: ["New"],
    notes: [
      "Admins can see monthly test activity, per-teacher activity, subject distribution, and a top-performers leaderboard, all backed by live data.",
      "Charts now show skeleton loading states and proper empty states instead of blank panels.",
    ],
  },
  {
    date: "September 2025",
    title: "AI Test Generator",
    tags: ["New"],
    notes: [
      "Teachers can generate a complete test from a topic, subject, difficulty, and question count — AI drafts questions, options, and explanations for review before publishing.",
      "Duration is now auto-estimated per test based on question type and count.",
    ],
  },
  {
    date: "August 2025",
    title: "Student & batch management overhaul",
    tags: ["Improved"],
    notes: [
      "Rebuilt the students page with searchable tables, batch grouping, and color-coded score badges.",
      "Fixed an issue where batch student counts could drift out of sync after bulk removals.",
    ],
  },
] as const;

export default function ChangelogPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Product"
        title="Changelog"
        description="What's shipped, in the order we shipped it."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12">
          <div className="space-y-12">
            {ENTRIES.map((entry) => (
              <div key={entry.title} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8">
                <div className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
                  {entry.date}
                </div>
                <div className="pb-10 border-b border-slate-100 last:border-0">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <h3 className="font-bold text-lg" style={{ color: "#0F172A" }}>
                      {entry.title}
                    </h3>
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                          TAG_STYLES[tag]
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-2 text-sm leading-relaxed" style={{ color: "#64748B" }}>
                    {entry.notes.map((note, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="mt-2 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
