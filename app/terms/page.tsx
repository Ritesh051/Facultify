import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: (
      <p>
        {`By creating an account or using Facultify, you agree to these Terms of Service. If you're
        signing up on behalf of an institution, you're confirming you have the authority to bind
        that institution to these terms.`}
      </p>
    ),
  },
  {
    title: "2. Description of service",
    body: (
      <p>
        Facultify is a subscription assessment platform for educational institutions, providing
        test creation (manual and AI-assisted), auto-grading, student portals, and analytics
        across admin, teacher, and student roles.
      </p>
    ),
  },
  {
    title: "3. Accounts and roles",
    body: (
      <p>
        {`Admin accounts are created directly at signup and own the institution's subscription.
        Teacher and student accounts are created via email invitation from an admin or teacher.
        Each account is for one individual and may not be shared. You're responsible for keeping
        your login credentials secure.`}
      </p>
    ),
  },
  {
    title: "4. Institution data ownership",
    body: (
      <p>
        Your institution owns all tests, questions, submissions, and analytics created within your
        account. We act as a processor of that data on your behalf and do not claim ownership of
        academic content you create.
      </p>
    ),
  },
  {
    title: "5. Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>Attempt to access data belonging to another institution.</li>
          <li>Use the platform to distribute harmful, unlawful, or infringing content.</li>
          <li>Reverse-engineer, scrape, or overload the service in a way that degrades it for others.</li>
          <li>Circumvent role-based access controls (e.g. a student attempting admin actions).</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Subscription and billing",
    body: (
      <p>
        Paid plans are billed on the cycle selected at signup. You can cancel at any time from
        institution settings; access continues through the end of the current billing period.
        Fees are non-refundable except where required by law.
      </p>
    ),
  },
  {
    title: "7. Intellectual property",
    body: (
      <p>
        {`The Facultify name, logo, and underlying software are our property. Nothing in these terms
        grants you rights to our trademarks or source code beyond what's needed to use the service
        as intended.`}
      </p>
    ),
  },
  {
    title: "8. Termination",
    body: (
      <p>
        {`We may suspend or terminate accounts that violate these terms, pose a security risk, or
        remain unpaid after a reasonable notice period. You may close your institution's account
        at any time; we will delete or anonymize associated data per our Privacy Policy.`}
      </p>
    ),
  },
  {
    title: "9. Disclaimers & limitation of liability",
    body: (
      <p>
        {`Facultify is provided "as is." We work to keep the service reliable and accurate, but we
        don't guarantee it will be uninterrupted or error-free. To the extent permitted by law, our
        liability for any claim relating to the service is limited to the amount paid for the
        service in the twelve months preceding the claim.`}
      </p>
    ),
  },
  {
    title: "10. Changes to these terms",
    body: (
      <p>
        {`We may update these terms as the product evolves. We'll post the updated version here with
        a new effective date; continued use of the service after a change constitutes acceptance.`}
      </p>
    ),
  },
  {
    title: "11. Contact",
    body: (
      <p>
        Questions about these terms can be sent to{" "}
        <a href="mailto:legal@facultify.com" className="text-blue-600 hover:underline">
          legal@facultify.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main>
      <MarketingNav />

      <PageHero eyebrow="Legal" title="Terms of Service" description="Last updated: January 2026" />

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
