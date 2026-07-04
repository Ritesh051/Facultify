import { Rocket, Users2, HeartHandshake, Globe2 } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const CULTURE = [
  {
    icon: Rocket,
    title: "Small team, real ownership",
    description: "Every hire owns a meaningful piece of the product, not a slice of a slice.",
  },
  {
    icon: Users2,
    title: "Close to the people we build for",
    description: "We talk to teachers and admins directly — feature ideas skip the layers of translation.",
  },
  {
    icon: HeartHandshake,
    title: "Remote-friendly, async by default",
    description: "Work from where you're productive. We optimize for written clarity over meetings.",
  },
  {
    icon: Globe2,
    title: "Impact you can see",
    description: "The tests you help ship get taken by real students within weeks, not quarters.",
  },
];

export default function CareersPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Careers"
        title="We're not hiring right now — but we'd still like to meet you"
        description="Facultify is a small team building assessment software for schools and colleges. We don't have open roles at the moment, but we keep a list of people to reach out to first when that changes."
      />

      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-12">
          <h2
            className="text-2xl sm:text-3xl font-black tracking-[-0.02em] mb-12 text-center"
            style={{ color: "#0F172A" }}
          >
            How we work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CULTURE.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#3B6FFF" }} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: "#0F172A" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#F8FAFF" }}>
        <div className="mx-auto w-full max-w-2xl px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-[-0.02em] mb-3" style={{ color: "#0F172A" }}>
            Get on our radar
          </h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: "#64748B" }}>
            {"Send a short note about what you're good at and what you'd want to work on to "}
            <a href="mailto:careers@facultify.com" className="text-blue-600 hover:underline">
              careers@facultify.com
            </a>
            . We read everything, even without an open role to point you at.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
