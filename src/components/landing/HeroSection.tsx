import { lazy, Suspense } from "react";

// Lazy load para melhor performance
const ChromaHero = lazy(() => import("./ChromaHero"));

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
    >
      {/* WebGL Chromatic Aberration Effect */}
      <Suspense fallback={<div className="absolute inset-0 bg-[#0a0a0a]" />}>
        <ChromaHero />
      </Suspense>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none z-[1]" />
    </section>
  );
}
