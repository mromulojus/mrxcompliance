import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/ui/hero-section";
import { FeatureSteps } from "@/components/ui/feature-section";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { StatsSection } from "@/components/ui/stats-section";
import { Footer } from "@/components/ui/footer";

const features = [
  { 
    step: 'PLAN', 
    title: 'Planejamento Estratégico',
    content: 'Defina objetivos claros e estratégias eficazes para o crescimento da sua empresa com ferramentas avançadas de planejamento.', 
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    step: 'CHECK',
    title: 'Monitoramento Contínuo',
    content: 'Acompanhe o progresso em tempo real com dashboards intuitivos e relatórios detalhados para tomada de decisões informadas.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    step: 'CONTROL',
    title: 'Controle Total',
    content: 'Mantenha controle absoluto sobre todos os aspectos do seu negócio com ferramentas de gestão integradas e automação inteligente.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop'
  },
];

export default function Homepage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <div id="features">
          <FeatureSteps 
            features={features}
            title="Metodologia PLAN • CHECK • CONTROL"
            autoPlayInterval={4000}
            imageHeight="h-[500px]"
          />
        </div>
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}