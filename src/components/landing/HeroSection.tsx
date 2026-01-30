import CursorDistortion from "./CursorDistortion";
import heroPortrait from "@/assets/hero-portrait.jpg";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
    >
      {/* WebGL Cursor Distortion Effect */}
      <CursorDistortion imageSrc={heroPortrait} />
      
      {/* Gradient overlay for better text readability if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
    </section>
  );
}
