"use client";

import { Hero } from "@/components/ui/hero";
import { Icons } from "@/components/ui/icons";
import { ProjectStatusCard } from "@/components/ui/expandable-card";
import { ShieldCheck, LineChart, FileCheck2, LinkIcon } from "lucide-react";

function PreviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ProjectStatusCard
        title="Compliance Operacional"
        progress={82}
        dueDate="Jul 30, 2025"
        contributors={[{ name: "Ana" }, { name: "Bruno" }, { name: "Clara" }]}
        tasks={[{ title: "Mapeamento de riscos", completed: true }, { title: "Treinamentos", completed: true }, { title: "Auditoria interna", completed: false }]}
        githubStars={124}
        openIssues={3}
      />
      <ProjectStatusCard
        title="LGPD & Controles"
        progress={64}
        dueDate="Aug 12, 2025"
        contributors={[{ name: "Diego" }, { name: "Eva" }, { name: "Fábio" }]}
        tasks={[{ title: "Relatórios de conformidade", completed: true }, { title: "Plano de ação", completed: false }, { title: "Monitoramento", completed: false }]}
        githubStars={89}
        openIssues={5}
      />
    </div>
  );
}

export function HeroCompliance() {
  return (
    <Hero
      pill={{
        text: "PLAN • CHECK • CONTROL",
        href: "/home#metodo",
        icon: <Icons.logo className="h-4 w-4" />,
        variant: "default",
        size: "md",
      }}
      content={{
        title: "Compliance Empresarial sob Medida"
          "Estruture, monitore e controle seus processos de compliance com nosso método exclusivo. Conte com especialistas dedicados ao sucesso do seu negócio.",
        primaryAction: {
          href: "/contato",
          text: "Quero aplicar Compliance de Verdade",
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        secondaryAction: {
          href: "/diagnostico",
          text: "Solicite diagnóstico gratuito",
          icon: <LineChart className="h-4 w-4" />,
        },
      }}
      preview={
        <div className="space-y-6">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop"
            alt="Equipe em reunião estratégica"
            className="rounded-xl border shadow-sm"
          />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border p-4">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <FileCheck2 className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">PLAN</div>
              <div className="text-xs text-muted-foreground">Planejamento</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <LineChart className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">CHECK</div>
              <div className="text-xs text-muted-foreground">Auditoria</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <LinkIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">CONTROL</div>
              <div className="text-xs text-muted-foreground">Ações de Controle</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>+10 anos de experiência</span>
            <span>Clientes em todo Brasil</span>
            <span>Consultoria personalizada</span>
          </div>
        </div>
      }
    />
  );
}

export default HeroCompliance;

