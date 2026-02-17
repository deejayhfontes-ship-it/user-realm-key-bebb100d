import { useEffect } from "react";
import { HeroSection } from "@/components/platform/HeroSection";
import { ProblemSolutionSection } from "@/components/platform/ProblemSolutionSection";
import { GeneratorsSection } from "@/components/platform/GeneratorsSection";
import { HowItWorksSection } from "@/components/platform/HowItWorksSection";
import { PricingSection } from "@/components/platform/PricingSection";
import { FAQSection } from "@/components/platform/FAQSection";
import { CTASection } from "@/components/platform/CTASection";
import { PlatformFooter } from "@/components/platform/PlatformFooter";

export default function Platform() {
  // SEO: Set document title
  useEffect(() => {
    document.title = "Fontes Graphics Platform - Gere Artes Profissionais com IA";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Plataforma SaaS de geração de artes com IA. Crie stories, posts e carrosséis profissionais em segundos. Usado por empresas que confiam na inovação.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection />
      <ProblemSolutionSection />
      <GeneratorsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <PlatformFooter />
    </div>
  );
}
