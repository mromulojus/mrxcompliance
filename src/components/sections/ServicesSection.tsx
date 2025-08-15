import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Building, 
  Leaf, 
  MessageSquare, 
  Calculator, 
  FileText,
  ChevronDown,
  ArrowRight,
  Factory,
  DollarSign,
  Briefcase
} from "lucide-react";

export function ServicesSection() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const filters = ["Todos", "Startups", "Indústria", "Financeiro", "Tecnologia"];

  const services = [
    {
      id: 1,
      title: "Consultoria em Compliance",
      description: "Implementação completa de programas de compliance corporativo",
      icon: Shield,
      sector: ["Todos", "Indústria", "Financeiro"],
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      deliverables: [
        "Diagnóstico de Compliance",
        "Políticas e Procedimentos",
        "Treinamentos Corporativos",
        "Sistema de Monitoramento"
      ],
      price: "A partir de R$ 15.000"
    },
    {
      id: 2,
      title: "Programas de Integridade",
      description: "Desenvolvimento e implantação de programas anticorrupção",
      icon: FileText,
      sector: ["Todos", "Indústria", "Financeiro"],
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      deliverables: [
        "Código de Conduta",
        "Canal de Denúncias",
        "Due Diligence de Terceiros",
        "Programa de Treinamento"
      ],
      price: "A partir de R$ 20.000"
    },
    {
      id: 3,
      title: "Governança Corporativa",
      description: "Estruturação de governança e controles internos",
      icon: Building,
      sector: ["Todos", "Indústria", "Financeiro"],
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
      deliverables: [
        "Estrutura de Governança",
        "Matriz de Responsabilidades",
        "Comitês Especializados",
        "Relatórios Gerenciais"
      ],
      price: "A partir de R$ 25.000"
    },
    {
      id: 4,
      title: "Consultoria ESG",
      description: "Estratégias ambientais, sociais e de governança",
      icon: Leaf,
      sector: ["Todos", "Startups", "Indústria"],
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      deliverables: [
        "Diagnóstico ESG",
        "Relatório de Sustentabilidade",
        "Indicadores ESG",
        "Plano de Melhoria"
      ],
      price: "A partir de R$ 18.000"
    },
    {
      id: 5,
      title: "Ouvidoria Empresarial",
      description: "Implementação de canais de comunicação e ouvidoria",
      icon: MessageSquare,
      sector: ["Todos", "Indústria", "Financeiro"],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      deliverables: [
        "Canal de Ouvidoria",
        "Protocolo de Atendimento",
        "Dashboard de Métricas",
        "Relatórios Periódicos"
      ],
      price: "A partir de R$ 12.000"
    },
    {
      id: 6,
      title: "Debto – Gestão de Cobrança",
      description: "Solução completa para gestão de crédito e cobrança",
      icon: Calculator,
      sector: ["Todos", "Financeiro", "Tecnologia"],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      deliverables: [
        "Sistema de Cobrança",
        "Análise de Crédito",
        "Recuperação de Ativos",
        "Relatórios Financeiros"
      ],
      price: "A partir de R$ 10.000"
    }
  ];

  const filteredServices = services.filter(service => 
    activeFilter === "Todos" || service.sector.includes(activeFilter)
  );

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case "Startups": return Briefcase;
      case "Indústria": return Factory;
      case "Financeiro": return DollarSign;
      case "Tecnologia": return Building;
      default: return Building;
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Serviços <span className="text-primary">Modulares</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Soluções personalizadas para cada setor e necessidade empresarial
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => {
            const IconComponent = getSectorIcon(filter);
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300
                  ${activeFilter === filter 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border hover:border-primary/50'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span className="font-medium">{filter}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`
                bg-card border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer
                ${expandedCard === service.id ? `${service.borderColor} shadow-lg` : 'border-border/50'}
              `}
            >
              {/* Card Header */}
              <div className="p-6 space-y-4">
                <div className={`w-16 h-16 rounded-2xl ${service.bgColor} ${service.borderColor} border-2 flex items-center justify-center`}>
                  <service.icon className={`w-8 h-8 ${service.color}`} />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>

                {/* Sectors */}
                <div className="flex flex-wrap gap-2">
                  {service.sector.filter(s => s !== "Todos").map((sector) => (
                    <Badge key={sector} variant="secondary" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedCard(expandedCard === service.id ? null : service.id)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="font-medium text-primary">Ver detalhes</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedCard === service.id ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Expanded Content */}
              {expandedCard === service.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 space-y-4 border-t border-border/50"
                >
                  <div>
                    <h4 className="font-semibold mb-3">Entregáveis:</h4>
                    <ul className="space-y-2">
                      {service.deliverables.map((deliverable, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Investimento</p>
                      <p className="font-bold text-primary">{service.price}</p>
                    </div>
                    <Button size="sm" className="group">
                      Solicitar Proposta
                      <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}