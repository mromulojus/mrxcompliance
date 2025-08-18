import React from 'react';
import { Building2, Users, TrendingUp, Shield } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    value: "500+",
    label: "Empresas Atendidas",
    description: "Empresas confiam em nossa plataforma"
  },
  {
    icon: Users,
    value: "10K+",
    label: "Colaboradores Gerenciados",
    description: "Usuários ativos na plataforma"
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Eficiência Operacional",
    description: "Melhoria nos processos empresariais"
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Uptime Garantido",
    description: "Disponibilidade e confiabilidade"
  }
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground">
            Números que impressionam
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resultados comprovados que demonstram a eficácia de nossa solução
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 p-8 shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(400px_120px_at_20%_0%,hsl(var(--primary)/0.06),transparent_60%)]" />
              <div className="relative z-[1] flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/15 transition-colors">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-base md:text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}