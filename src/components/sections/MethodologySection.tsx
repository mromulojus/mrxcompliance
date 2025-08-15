import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Search, BarChart3, ArrowRight, Info } from "lucide-react";

export function MethodologySection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      phase: "PLAN",
      title: "Mapeamento de Riscos",
      description: "Auditoria documental completa e identificação de vulnerabilidades",
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      details: {
        title: "Fase PLAN - Planejamento Estratégico",
        content: [
          "Mapeamento completo de riscos corporativos",
          "Auditoria documental de processos existentes",
          "Identificação de gaps de compliance",
          "Definição de políticas e procedimentos",
          "Cronograma de implementação personalizado"
        ],
        deliverables: [
          "Relatório de Diagnóstico",
          "Matriz de Riscos",
          "Plano de Ação Estratégico",
          "Políticas Corporativas"
        ]
      }
    },
    {
      phase: "CHECK",
      title: "Revisão de Processos",
      description: "Análise detalhada de políticas e identificação de gaps críticos",
      icon: Search,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      details: {
        title: "Fase CHECK - Monitoramento e Verificação",
        content: [
          "Revisão sistemática de processos",
          "Testes de controles internos",
          "Validação de procedimentos",
          "Análise de efetividade",
          "Identificação de melhorias"
        ],
        deliverables: [
          "Relatório de Auditoria",
          "Plano de Correções",
          "Dashboard de Monitoramento",
          "Indicadores de Performance"
        ]
      }
    },
    {
      phase: "CONTROL",
      title: "Monitoramento Contínuo",
      description: "Controle permanente e relatórios de conformidade automatizados",
      icon: BarChart3,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
      details: {
        title: "Fase CONTROL - Controle e Governança",
        content: [
          "Monitoramento contínuo de indicadores",
          "Relatórios automatizados de compliance",
          "Sistema de alertas preventivos",
          "Acompanhamento de KPIs",
          "Atualização constante de políticas"
        ],
        deliverables: [
          "Dashboard Executivo",
          "Relatórios Mensais",
          "Sistema de Alertas",
          "Plano de Continuidade"
        ]
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Metodologia <span className="text-primary">PLAN</span> {'>'}{' '}
            <span className="text-secondary">CHECK</span> {'>'}{' '}
            <span className="text-accent">CONTROL</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nossa metodologia proprietária garante implementação eficaz e resultados mensuráveis
            em todas as fases do projeto de compliance
          </p>
        </motion.div>

        {/* Interactive Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full transform -translate-y-1/2 hidden lg:block" />
          
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
                onMouseEnter={() => setActiveStep(index)}
              >
                <div className={`
                  relative bg-card border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl cursor-pointer
                  ${activeStep === index ? `${step.borderColor} shadow-lg scale-105` : 'border-border/50'}
                `}>
                  {/* Step Number */}
                  <div className={`
                    absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                    ${step.color.replace('text-', 'bg-')}
                  `}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.bgColor} ${step.borderColor} border-2 flex items-center justify-center mb-6`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className={`text-2xl font-bold ${step.color}`}>
                      {step.phase}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="group">
                          Saiba Mais
                          <Info className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <step.icon className={`w-6 h-6 ${step.color}`} />
                            {step.details.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-3">Atividades Principais:</h4>
                            <ul className="space-y-2">
                              {step.details.content.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Entregáveis:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {step.details.deliverables.map((deliverable, i) => (
                                <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm">
                                  {deliverable}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button size="lg" className="group">
            Solicite uma Demonstração da Metodologia
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}