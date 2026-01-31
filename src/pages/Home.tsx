import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProjectsSection } from "@/components/landing/ProjectsSection";
import { GeneratorsSection } from "@/components/landing/GeneratorsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ClientsSection } from "@/components/landing/ClientsSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { LiveChatWidget } from "@/components/landing/LiveChatWidget";
import { usePublicHomeSections } from "@/hooks/useHomeSections";

export default function Home() {
  const { data: sections } = usePublicHomeSections();

  // Helper to check if section is active
  const isSectionActive = (slug: string): boolean => {
    // If no sections data, show all by default
    if (!sections || sections.length === 0) return true;
    const section = sections.find(s => s.slug === slug);
    return section?.is_active ?? true;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main>
        {/* Hero is always visible */}
        <HeroSection />
        
        {/* Cards Principais */}
        {isSectionActive('projects') && <ProjectsSection />}
        
        {/* Geradores IA */}
        {isSectionActive('generators') && <GeneratorsSection />}
        
        {/* Sobre Nós */}
        {isSectionActive('about') && <AboutSection />}
        
        {/* Parceiros Criativos */}
        {isSectionActive('clients') && <ClientsSection />}
        
        {/* Serviços */}
        {isSectionActive('services') && <ServicesSection />}
        
        {/* Contato */}
        {isSectionActive('contact') && <ContactSection />}
      </main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}
