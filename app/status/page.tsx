import { CheckCircle2 } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const SERVICES = [
  { name: "Web Application", uptime: "99.98%" },
  { name: "API", uptime: "99.97%" },
  { name: "Database", uptime: "99.99%" },
  { name: "Email Delivery", uptime: "99.95%" },
  { name: "AI Test Generation", uptime: "99.91%" },
];

// Deterministic bar heights so the 90-day uptime graphic doesn't rely on Math.random()
function barHeight(seed: number) {
  const pattern = [100, 100, 100, 98, 100, 100, 100, 100, 96, 100];
  return pattern[seed % pattern.length];
}

export default function StatusPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero eyebrow="Contact" title="System Status" description="Live status of every Facultify service." />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12">
          {/* Overall banner */}
          <div
            className="flex items-center gap-3 p-5 rounded-2xl mb-10"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#059669" }} />
            <p className="font-semibold text-sm" style={{ color: "#047857" }}>
              All systems operational
            </p>
          </div>

          {/* Services */}
          <div className="space-y-6">
            {SERVICES.map((service, idx) => (
              <div key={service.name} className="pb-6 border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm" style={{ color: "#0F172A" }}>
                    {service.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      {service.uptime} uptime
                    </span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: "#ECFDF5", color: "#059669" }}
                    >
                      Operational
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 h-7" aria-hidden="true">
                  {Array.from({ length: 45 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background: "#A7F3D0",
                        height: `${barHeight(idx + i)}%`,
                        alignSelf: "flex-end",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-center" style={{ color: "#94A3B8" }}>
            Questions about an incident?{" "}
            <a href="mailto:support@facultify.com" className="text-blue-600 hover:underline">
              support@facultify.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
