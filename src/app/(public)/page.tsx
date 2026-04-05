import { Hero } from "@/components/landing/Hero";
import { SellingPoints } from "@/components/landing/SellingPoints";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTABanner } from "@/components/landing/CTABanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "todoMasterAI — Free AI-Powered Todo App",
  description:
    "The 100% free, AI-powered todo app. No ads, no credit card, no catch. Organize tasks with lists, kanban boards, calendar views, and more.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SellingPoints />
      <FeaturesGrid />
      <HowItWorks />
      <SocialProof />
      <CTABanner />
    </>
  );
}
