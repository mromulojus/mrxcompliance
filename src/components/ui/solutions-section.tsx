import React from "react";
import { ShieldCheck, Megaphone, FileSearch2 } from "lucide-react";

type SolutionCardProps = {
  icon: React.ReactNode;
  title: string;
  what: string;
  do: string;
};

function SolutionCard({ icon, title, what, do: doText }: SolutionCardProps) {
  return (
    <div className="group relative rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 p-6 shadow-sm overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(400px_120px_at_20%_0%,hsl(var(--primary)/0.06),transparent_60%)]" />
      <div className="relative z-[1]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">O que é:</span> {what}
          </p>
          <p>
            <span className="font-medium text-foreground">O que fazemos:</span> {doText}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SolutionsSection() {
  return (
    <section id="solucoes" className="py-16 md:py-24 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Soluções completas para a sua empresa.
          </h2>
          <p className="text-lg text-muted-foreground">
            Além do nosso Protocolo de Compliance, oferecemos um ecossistema de soluções complementares que garantem a segurança jurídica e a saúde financeira do seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SolutionCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="MRX Compliance"
            what="Nosso serviço padrão para implementação de um framework completo de compliance e governança."
            do="Estabelecemos um programa de integridade, realizamos auditoria contínua, criamos indicadores de performance e desenvolvemos uma cultura organizacional de ética e transparência."
          />

          <SolutionCard
            icon={<Megaphone className="h-5 w-5" />}
            title="Ouve.ai (Canal de Ética e Denúncias)"
            what="Sistema centralizado para registro e acompanhamento de questões éticas e de conformidade, com transparência e confidencialidade."
            do="Implementamos um canal de denúncias eficaz e seguro, protegendo o denunciante contra retaliações e garantindo um processo transparente de investigação."
          />

          <SolutionCard
            icon={<FileSearch2 className="h-5 w-5" />}
            title="Debto (Departamento Terceirizado de Cobrança)"
            what="Departamento terceirizado que opera via processo estruturado de 9 etapas para a recuperação de créditos."
            do="Mapeamos os títulos, formalizamos a cobrança legalmente, lançamos no nosso sistema proprietário e realizamos campanhas administrativas com IA para maximizar a taxa de recuperação."
          />
        </div>
      </div>
    </section>
  );
}

export default SolutionsSection;

