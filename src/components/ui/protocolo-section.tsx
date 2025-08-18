import React from "react";
import { ClipboardList, FileCheck2, ShieldCheck, LineChart } from "lucide-react";

type PhaseCardProps = {
  phase: string;
  title: string;
  what: string;
  do: string;
  result: string;
  icon: React.ReactNode;
};

function PhaseCard({ phase, title, what, do: doText, result, icon }: PhaseCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{phase}</div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">O que é:</span> {what}
        </p>
        <p>
          <span className="font-medium text-foreground">O que fazemos:</span> {doText}
        </p>
        <p>
          <span className="font-medium text-foreground">Resultado para você:</span> {result}
        </p>
      </div>
    </div>
  );
}

export function ProtocoloSection() {
  return (
    <section id="metodo" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            O Protocolo Exclusivo que Transforma Compliance em Vantagem Competitiva.
          </h2>
          <p className="text-lg text-muted-foreground">
            Nossa metodologia, PLAN • CHECK • CONTROL, é um processo robusto e estruturado em 4 fases fundamentais, desenhado para identificar, corrigir e monitorar as conformidades da sua empresa. Utiliza nosso software proprietário MRx Br para automação e otimização de cada etapa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PhaseCard
            phase="FASE 01 - PLAN"
            title="Mapeamento de Riscos e Coleta de Dados"
            what="Etapa inicial onde identificamos e organizamos os documentos essenciais da sua empresa para avaliação completa de riscos."
            do="Levantamos informações contábeis, fiscais, trabalhistas e de governança para obter uma visão 360° do seu negócio."
            result="Diagnóstico preciso de pontos de atenção e riscos potenciais."
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <PhaseCard
            phase="FASE 02 - CHECK"
            title="Revisão de Documentos e Validação"
            what="Verificamos qualidade, atualização e validade de cada documento para garantir aderência às normas e melhores práticas."
            do="Aplicamos checklists detalhados (PF, PJ, ESG) para auditar documentos, assegurando a conformidade legal."
            result="Certeza de conformidade documental e processual, protegendo contra passivos jurídicos."
            icon={<FileCheck2 className="h-5 w-5" />}
          />
          <PhaseCard
            phase="FASE 03 - CONTROL"
            title="Implementação e Ações Corretivas"
            what="Aplicamos medidas estratégicas para corrigir falhas e inconsistências, estruturando o programa de compliance."
            do="Implementamos políticas, códigos de conduta e planos de ação para mitigar riscos."
            result="Estrutura de governança sólida, controles eficientes e cultura ética fortalecida."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <PhaseCard
            phase="FASE 04 - MONITOR"
            title="Auditoria e Melhoria Contínua"
            what="Garantimos continuidade da conformidade por meio de auditorias internas e externas periódicas."
            do="Realizamos auditorias regulares, consolidamos achados e definimos planos de remediação, utilizando o MRx Br."
            result="Programa vivo e adaptável que evolui com sua empresa e o mercado."
            icon={<LineChart className="h-5 w-5" />}
          />
        </div>
      </div>
    </section>
  );
}

export default ProtocoloSection;

