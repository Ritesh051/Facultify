"use client";

import { useState } from "react";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import MarketingNav from "@/components/marketing/MarketingNav";
import Footer from "@/components/marketing/Footer";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_POINTS = [
  {
    icon: Mail,
    title: "Email",
    detail: "support@facultify.com",
    href: "mailto:support@facultify.com",
  },
  {
    icon: MessageSquare,
    title: "Sales",
    detail: "sales@facultify.com",
    href: "mailto:sales@facultify.com",
  },
  {
    icon: Clock,
    title: "Response time",
    detail: "Within 1 business day",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Message sent — we'll get back to you within a business day.");
    }, 600);
  }

  return (
    <main>
      <MarketingNav />

      <PageHero
        eyebrow="Contact"
        title="Talk to the team"
        description="Questions about pricing, a demo, or your existing account — send a message and a real person will reply."
      />

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12">
            {/* Contact points */}
            <div className="space-y-6">
              {CONTACT_POINTS.map((point) => {
                const Icon = point.icon;
                const content = (
                  <div className="flex items-start gap-4">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                      style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)" }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: "#3B6FFF" }} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#0F172A" }}>
                        {point.title}
                      </p>
                      <p className="text-sm" style={{ color: "#64748B" }}>
                        {point.detail}
                      </p>
                    </div>
                  </div>
                );
                return point.href ? (
                  <a key={point.title} href={point.href} className="block hover:opacity-80 transition-opacity">
                    {content}
                  </a>
                ) : (
                  <div key={point.title}>{content}</div>
                );
              })}
            </div>

            {/* Form */}
            <div className="p-8 rounded-2xl border border-slate-200/80" style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
              {submitted ? (
                <div className="text-center py-8">
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#0F172A" }}>
                    Message sent
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Thanks, {name.split(" ")[0]} — we'll reply to {email} within a business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution (optional)</Label>
                    <Input
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Springfield High School"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
