import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const COLUMNS = [
  {
    key: "now",
    label: "In progress",
    dot: "#3B6FFF",
    items: [
      "Resume support for a test a student started but didn't finish",
      "Bulk question import from spreadsheets",
      "Configurable grading rubrics for written answers",
    ],
  },
  {
    key: "next",
    label: "Up next",
    dot: "#7C3AED",
    items: [
      "Google Classroom & Canvas roster sync",
      "Plagiarism detection for written answers",
      "Parent/guardian view of student results",
      "Native mobile app for students",
    ],
  },
  {
    key: "later",
    label: "Exploring",
    dot: "#94A3B8",
    items: [
      "Multi-language test authoring and translation",
      "Proctoring integrations for high-stakes exams",
      "Question bank marketplace across institutions",
    ],
  },
] as const;

export default function RoadmapPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Product"
        title="Roadmap"
        description="What we're building next. Have a request? Tell us at support@facultify.com — most of what's here started as a customer conversation."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((column) => (
              <div key={column.key} className="rounded-2xl border border-slate-200/80 p-6" style={{ background: "#F8FAFF" }}>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full" style={{ background: column.dot }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#0F172A" }}>
                    {column.label}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm leading-relaxed bg-white rounded-xl border border-slate-200/80 p-4"
                      style={{ color: "#334155" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
