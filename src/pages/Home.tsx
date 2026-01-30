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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main>
        <HeroSection />
        <ProjectsSection />
        <GeneratorsSection />
        <AboutSection />
        <ClientsSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}
