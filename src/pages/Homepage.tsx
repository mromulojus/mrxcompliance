import { CorporateHeader } from "@/components/ui/corporate-header";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { MethodologySection } from "@/components/sections/MethodologySection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ROICalculator } from "@/components/sections/ROICalculator";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FloatingCTA } from "@/components/sections/FloatingCTA";
import { Footer } from "@/components/ui/footer";
import { SplashCursor } from "@/components/ui/splash-cursor";

export default function Homepage() {
  return (
    <div className="min-h-screen">
      <SplashCursor />
      <CorporateHeader />
      <main>
        <HeroSection />
        <TrustBar />
        <MethodologySection />
        <ServicesSection />
        <ROICalculator />
        <TestimonialsSection />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}