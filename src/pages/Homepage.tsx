import { Component as HeroSection } from "@/components/ui/horizon-hero-section";
import { Header } from "@/components/ui/header";

export default function Homepage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}