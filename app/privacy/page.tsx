import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: (
      <>
        <p>We collect information in three ways:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>
            <strong>Account information</strong> you provide directly — name, email address, institution
            name, and role (admin, teacher, or student) — when you sign up or are invited.
          </li>
          <li>
            <strong>Academic content</strong> created while using Facultify — tests, questions, student
            submissions, grades, and analytics generated from that data.
          </li>
          <li>
            <strong>Usage data</strong> collected automatically — pages visited, actions taken, browser
            type, and timestamps — used to keep the service reliable and secure.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "2. How we use information",
    body: (
      <p>
        We use collected information to operate the platform: authenticating accounts, isolating
        each institution's data from every other institution, auto-grading submissions, generating
        analytics, sending transactional emails (invites, confirmations), and improving product
        reliability. We do not sell personal information, and we do not use one institution's data
        to benefit another.
      </p>
    ),
  },
  {
    title: "3. Data isolation between institutions",
    body: (
      <p>
        Facultify is multi-tenant software: many institutions share the same infrastructure, but
        data is isolated at the database level using row-level security. A teacher or admin at one
        institution cannot query or view another institution's students, tests, or results — this
        is enforced by the database itself, not just the application layer.
      </p>
    ),
  },
  {
    title: "4. Third-party services",
    body: (
      <>
        <p>We rely on a small number of infrastructure providers to operate Facultify:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>
            <strong>Supabase</strong> — hosts our database, authentication, and file storage.
          </li>
          <li>
            <strong>Resend</strong> — delivers transactional emails, such as teacher and student
            invitations.
          </li>
          <li>
            An AI model provider, used only to draft AI-generated test questions from a topic a
            teacher supplies — never with student submission data.
          </li>
        </ul>
        <p className="mt-3">
          Each provider is contractually restricted to processing data solely to provide their
          service to us.
        </p>
      </>
    ),
  },
  {
    title: "5. Data retention",
    body: (
      <p>
        We retain institution data for as long as an institution's account remains active. If an
        institution closes its account, we delete or anonymize associated data within a reasonable
        period, except where retention is required to comply with legal obligations.
      </p>
    ),
  },
  {
    title: "6. Students and minors",
    body: (
      <p>
        Facultify is provided to educational institutions, which act as the data controller for
        their students, including any students under 18. Institutions are responsible for
        obtaining any consent required under applicable education-privacy laws (such as FERPA)
        before adding student accounts. We process student data solely on the institution's
        instructions and for the purpose of delivering the assessment platform.
      </p>
    ),
  },
  {
    title: "7. Security",
    body: (
      <p>
        We use industry-standard safeguards, including encrypted connections, hashed credentials,
        and database-level access rules. No system is perfectly secure, and we continuously review
        our practices as the platform grows.
      </p>
    ),
  },
  {
    title: "8. Your rights",
    body: (
      <p>
        Depending on your role and jurisdiction, you may have the right to access, correct, or
        request deletion of your personal information. Students and teachers should generally
        contact their institution's admin first, since institutions control their own account
        data; admins can reach us directly at{" "}
        <a href="mailto:privacy@facultify.com" className="text-blue-600 hover:underline">
          privacy@facultify.com
        </a>
        .
      </p>
    ),
  },
  {
    title: "9. Changes to this policy",
    body: (
      <p>
        We may update this policy as the product evolves. Material changes will be reflected here
        with an updated revision date.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated: January 2026" />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 lg:px-12 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
                {section.title}
              </h2>
              <div className="text-[0.9375rem] leading-relaxed" style={{ color: "#475569" }}>
                {section.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
