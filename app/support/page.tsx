import Link from "next/link";
import { ChevronDown, Mail, BookOpen, Activity } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const FAQS = [
  {
    question: "How do I invite a teacher to my institution?",
    answer:
      "As an admin, go to the Teachers page in your dashboard and click \"Invite Teacher.\" Enter their name, email, and subject — they'll receive a branded email with a one-click link to set up their account.",
  },
  {
    question: "Why hasn't a student's result shown up yet?",
    answer:
      "Results appear once a teacher declares them, or automatically after the delay configured on that test (2 minutes by default). Check the Grading Center — the teacher can declare results instantly from there.",
  },
  {
    question: "Can I edit an AI-generated test before publishing it?",
    answer:
      "Yes. The AI Test Generator produces a draft you can review, edit, regenerate, or save before it ever reaches students. Nothing is published automatically.",
  },
  {
    question: "What happens if a student loses their connection mid-test?",
    answer:
      "Answers autosave every 30 seconds, so a dropped connection or refresh won't cost a student their progress on questions already answered.",
  },
  {
    question: "Is my institution's data visible to other institutions?",
    answer:
      "No. Facultify enforces data isolation at the database level using row-level security — this holds even if there were a bug in the application code.",
  },
  {
    question: "How do I change my subscription plan?",
    answer:
      "Admins can update billing and plan details from the Billing page in the admin dashboard. Changes take effect at the start of the next billing cycle.",
  },
];

const RESOURCES = [
  { icon: BookOpen, title: "Documentation", description: "Setup guides for admins, teachers, and students.", href: "/docs" },
  { icon: Activity, title: "System Status", description: "Live status of every Facultify service.", href: "/status" },
  { icon: Mail, title: "Contact Support", description: "Can't find an answer? Send us a message directly.", href: "/contact" },
];

export default function SupportPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Contact"
        title="Help Center"
        description="Answers to common questions, plus a direct line to us if you're still stuck."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12">
          {/* Resource cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <Icon className="w-5 h-5 mb-3" style={{ color: "#3B6FFF" }} strokeWidth={1.75} />
                  <p className="font-bold text-sm mb-1" style={{ color: "#0F172A" }}>
                    {resource.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                    {resource.description}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* FAQ */}
          <h2 className="text-xl font-black tracking-[-0.01em] mb-6" style={{ color: "#0F172A" }}>
            Frequently asked questions
          </h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-[0.9375rem]" style={{ color: "#0F172A" }}>
                  {faq.question}
                  <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#64748B" }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl text-center" style={{ background: "#F8FAFF", border: "1px solid #E2E8F0" }}>
            <h3 className="font-bold text-lg mb-1.5" style={{ color: "#0F172A" }}>
              Still need help?
            </h3>
            <p className="text-sm mb-4" style={{ color: "#64748B" }}>
              Our team typically replies within one business day.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
