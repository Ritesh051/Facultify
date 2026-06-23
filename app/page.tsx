"use client";

import MarketingNav from "@/components/marketing/MarketingNav";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Pricing from "@/components/marketing/Pricing";
import Footer from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <main>
      <MarketingNav />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
