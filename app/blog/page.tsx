import { Mail } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const UPCOMING_TOPICS = [
  {
    title: "How instant auto-grading actually works",
    description:
      "A look under the hood at how MCQ submissions get scored the moment a student hits submit — no batch jobs, no overnight wait.",
  },
  {
    title: "Cutting grading time by 90%, one institution's story",
    description:
      "What changed for a teaching staff when written-answer grading dropped from a weekend to an afternoon.",
  },
  {
    title: "Designing multi-tenant security for schools",
    description:
      "Why row-level isolation matters when hundreds of institutions share one platform, and how we enforce it at the database layer.",
  },
];

export default function BlogPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Blog"
        title="Notes on assessment, grading, and building for schools"
        description="We're just getting the blog started. In the meantime, here's what we're planning to write about first."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12">
          <div className="space-y-4">
            {UPCOMING_TOPICS.map((topic) => (
              <div
                key={topic.title}
                className="p-6 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-[1.0625rem] mb-1.5" style={{ color: "#0F172A" }}>
                    {topic.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                    {topic.description}
                  </p>
                </div>
                <span
                  className="shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ background: "#EEF2FF", color: "#3B6FFF" }}
                >
                  Coming soon
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-10 p-8 rounded-2xl text-center"
            style={{ background: "#F8FAFF", border: "1px solid #E2E8F0" }}
          >
            <Mail className="w-6 h-6 mx-auto mb-3" style={{ color: "#3B6FFF" }} strokeWidth={1.75} />
            <h3 className="font-bold text-lg mb-1.5" style={{ color: "#0F172A" }}>
              Want to know when we publish?
            </h3>
            <p className="text-sm mb-1" style={{ color: "#64748B" }}>
              Email us at{" "}
              <a href="mailto:support@facultify.com" className="text-blue-600 hover:underline">
                support@facultify.com
              </a>{" "}
              {"and we'll let you know when the first post is live."}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
