import Link from "next/link";
import { Target, Heart, ShieldCheck, Sparkles } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "119+", label: "Institutions" },
  { value: "11,999+", label: "Students" },
  { value: "239,999+", label: "Tests Graded" },
];

const VALUES = [
  {
    icon: Target,
    title: "Time back for teaching",
    description:
      "Every hour spent manually grading MCQs is an hour not spent teaching. We build for that trade — automate the mechanical, protect the human.",
    color: "#3B6FFF",
    bg: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
  },
  {
    icon: ShieldCheck,
    title: "Institutions own their data",
    description:
      "Every school's tests, students, and results are isolated at the database level. Your data is yours — we never share it across institutions or use it to train anything.",
    color: "#059669",
    bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
  },
  {
    icon: Sparkles,
    title: "AI as a co-pilot, not a replacement",
    description:
      "AI drafts a test in seconds; a teacher still reviews, edits, and publishes it. We keep a human in the loop everywhere a grade or a question reaches a student.",
    color: "#7C3AED",
    bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
  },
  {
    icon: Heart,
    title: "Built with people who grade tests",
    description:
      "Every feature — result-declaration timing, batch management, the grading center — came from watching real teachers work around the limits of spreadsheets and paper.",
    color: "#E11D48",
    bg: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
  },
];

export default function AboutPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="About Facultify"
        title={
          <>
            Assessment software built{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #3B6FFF 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
              }}
            >
              for institutions
            </span>
            , not spreadsheets
          </>
        }
        description="Facultify started with a simple observation: teachers spend more time grading than teaching, and most schools were stitching that gap together with spreadsheets, paper, and late nights. We build the platform we wished existed."
      />

      {/* Story */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12">
          <h2
            className="text-2xl sm:text-3xl font-black tracking-[-0.02em] mb-6"
            style={{ color: "#0F172A" }}
          >
            Our story
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "#475569" }}>
            <p>
              Facultify was built after watching the same pattern repeat across schools and
              colleges: an admin managing teacher access through email threads, a teacher
              grading two hundred MCQ sheets by hand over a weekend, and a student waiting days
              to find out whether they passed. None of that delay was necessary — it was just
              what happens when institutions never had software designed for the way they
              actually run tests.
            </p>
            <p>
              So we built one platform that covers the entire cycle: an admin invites teachers
              in minutes, a teacher authors a test manually or lets AI draft one from a topic,
              students take it in a distraction-free portal with autosave, and MCQ submissions
              are scored the instant they land — before the last student in the room has even
              finished.
            </p>
            <p>
              {`We're a small, focused team, and we work directly with the institutions on the
              platform today to decide what gets built next. If you're currently running exams
              on paper or spreadsheets, we'd genuinely like to hear how — it usually becomes our
              next feature.`}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: "#F8FAFF" }}>
        <div className="mx-auto w-full max-w-4xl px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-3xl sm:text-4xl font-black tracking-[-0.02em]"
                  style={{ color: "#0F172A" }}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-sm" style={{ color: "#64748B" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-12">
          <h2
            className="text-2xl sm:text-3xl font-black tracking-[-0.02em] mb-12 text-center"
            style={{ color: "#0F172A" }}
          >
            What we optimize for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="p-6 rounded-2xl border border-slate-200/80"
                  style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}
                >
                  <div
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                    style={{ background: value.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: value.color }} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-bold text-[1.0625rem] mb-2" style={{ color: "#0F172A" }}>
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "#F8FAFF" }}>
        <div className="mx-auto w-full max-w-2xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-[-0.02em]" style={{ color: "#0F172A" }}>
            Want to bring Facultify to your institution?
          </h2>
          <p className="mt-3 text-base" style={{ color: "#64748B" }}>
            Set up takes under five minutes — no credit card required.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-slate-300 text-slate-700 font-medium">
              <Link href="/contact">Talk to Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
