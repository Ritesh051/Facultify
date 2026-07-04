import { Download, Mail } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";
import { Logo } from "@/components/shared/Logo";

const FACTS = [
  { label: "Founded", value: "2025" },
  { label: "Category", value: "EdTech / Assessment Software" },
  { label: "Institutions", value: "119+" },
  { label: "Students served", value: "11,999+" },
  { label: "Tests graded", value: "239,999+" },
];

export default function PressPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Press"
        title="Press & Media Kit"
        description="Boilerplate copy, brand assets, and a direct line to the team for anyone writing about Facultify."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12 space-y-14">
          {/* Boilerplate */}
          <div>
            <h2 className="text-xl font-black tracking-[-0.02em] mb-4" style={{ color: "#0F172A" }}>
              Boilerplate
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#475569" }}>
              Facultify is a multi-tenant assessment platform for schools and colleges. It gives
              institutions an end-to-end testing engine — AI-authored tests generated in seconds,
              instant auto-grading on submission, and analytics that surface exactly where a
              class is struggling. Admins manage teachers, teachers build and grade tests, and
              students take exams in a distraction-free portal with autosave, all under one
              secure, institution-isolated account.
            </p>
          </div>

          {/* Quick facts */}
          <div>
            <h2 className="text-xl font-black tracking-[-0.02em] mb-4" style={{ color: "#0F172A" }}>
              Quick facts
            </h2>
            <dl className="divide-y divide-slate-200 border-y border-slate-200">
              {FACTS.map((fact) => (
                <div key={fact.label} className="flex items-center justify-between py-3 text-sm">
                  <dt style={{ color: "#64748B" }}>{fact.label}</dt>
                  <dd className="font-semibold" style={{ color: "#0F172A" }}>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Brand assets */}
          <div>
            <h2 className="text-xl font-black tracking-[-0.02em] mb-4" style={{ color: "#0F172A" }}>
              Brand assets
            </h2>
            <div className="flex items-center gap-6 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 shrink-0">
                <Logo size={40} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "#0F172A" }}>
                  Facultify logo (PNG)
                </p>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {"For editorial use with attribution. Please don't alter the mark or colors."}
                </p>
              </div>
              <a
                href="/logo.png"
                download
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>

          {/* Media contact */}
          <div
            className="p-8 rounded-2xl text-center"
            style={{ background: "#F8FAFF", border: "1px solid #E2E8F0" }}
          >
            <Mail className="w-6 h-6 mx-auto mb-3" style={{ color: "#3B6FFF" }} strokeWidth={1.75} />
            <h3 className="font-bold text-lg mb-1.5" style={{ color: "#0F172A" }}>
              Media inquiries
            </h3>
            <p className="text-sm" style={{ color: "#64748B" }}>
              <a href="mailto:press@facultify.com" className="text-blue-600 hover:underline">
                press@facultify.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
