import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const NAV = [
  { href: "#getting-started", label: "Getting started" },
  { href: "#admins", label: "For admins" },
  { href: "#teachers", label: "For teachers" },
  { href: "#students", label: "For students" },
  { href: "#ai-generator", label: "AI Test Generator" },
  { href: "#faq", label: "FAQs" },
];

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 pb-14 border-b border-slate-100 last:border-0">
      <h2 className="text-xl font-black tracking-[-0.01em] mb-4" style={{ color: "#0F172A" }}>
        {title}
      </h2>
      <div className="space-y-4 text-[0.9375rem] leading-relaxed" style={{ color: "#475569" }}>
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Product"
        title="Documentation"
        description="Everything you need to set up and run Facultify at your institution."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
            {/* Sidebar nav */}
            <nav aria-label="Documentation sections" className="hidden lg:block">
              <ul className="sticky top-28 space-y-1 text-sm">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block px-3 py-2 rounded-md font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <div className="max-w-2xl">
              <DocSection id="getting-started" title="Getting started">
                <p>
                  Every institution starts with an <strong>admin account</strong>. Sign up at{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-sm">/auth/signup</code>,
                  confirm your email, then complete the four-step onboarding wizard — institution
                  name, plan, and a few basics. That's it: your dashboard is ready.
                </p>
                <p>
                  From there, an admin invites teachers by email, and teachers invite students into
                  batches. Everyone else on your team never needs to "sign up" — they just accept
                  the invite email and set a password.
                </p>
              </DocSection>

              <DocSection id="admins" title="For admins">
                <p>An admin manages the institution account and never touches test content directly:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Invite teachers by email and activate or deactivate their access.</li>
                  <li>View institution-wide analytics — test volume, performance trends, subject breakdown.</li>
                  <li>Manage billing, plan, and institution settings.</li>
                </ul>
              </DocSection>

              <DocSection id="teachers" title="For teachers">
                <p>Teachers own the full test lifecycle for their own classes:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Build a test manually with the step-by-step test builder, or generate one with AI.</li>
                  <li>Create batches (class groups) and invite students into them.</li>
                  <li>Grade written answers with feedback — MCQ and True/False are scored automatically.</li>
                  <li>Control exactly when results become visible to students: instantly, or after a delay.</li>
                </ul>
              </DocSection>

              <DocSection id="students" title="For students">
                <p>Students get a focused, distraction-free experience:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Take assigned tests with autosave every 30 seconds — a dropped connection never costs your answers.</li>
                  <li>See results as soon as your teacher declares them, with a full answer review.</li>
                  <li>Track your own performance over time on your personal analytics page.</li>
                </ul>
              </DocSection>

              <DocSection id="ai-generator" title="AI Test Generator">
                <p>
                  From a teacher's dashboard, open the AI Generator, describe the topic, subject,
                  difficulty, question count, and types you want. Facultify drafts a complete test
                  — questions, options, and explanations — in seconds. Review it, edit anything
                  that needs a human touch, and publish when it's ready. Nothing goes to students
                  without your review.
                </p>
              </DocSection>

              <DocSection id="faq" title="Frequently asked questions">
                <div>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>
                    Can students on the same test see each other's answers?
                  </p>
                  <p>No — every submission is isolated to the student who made it.</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>
                    How fast is grading?
                  </p>
                  <p>
                    MCQ and True/False answers are graded the instant a student submits. Written
                    answers wait for a teacher's review.
                  </p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>
                    Can one institution see another institution's data?
                  </p>
                  <p>
                    No. Data is isolated per institution at the database level — this is enforced
                    even if the application code has a bug.
                  </p>
                </div>
              </DocSection>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
