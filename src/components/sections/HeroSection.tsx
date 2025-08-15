import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Shield, Users, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export function HeroSection() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [countdown, setCountdown] = useState(24 * 60 * 60); // 24 horas em segundos

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuroraBackground className="relative min-h-screen flex items-center justify-center">
      {/* Background Video Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 z-10" />
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-6 py-2"
              >
                <Shield className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-primary">Compliance Empresarial</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                Compliance que{' '}
                <span className="text-primary">Protege</span>,<br />
                Consultoria que{' '}
                <span className="text-secondary">Resolve</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-muted-foreground"
              >
                Especialistas em Governança Corporativa com metodologia{' '}
                <span className="font-semibold text-primary">PLAN</span> {'>'}{' '}
                <span className="font-semibold text-secondary">CHECK</span> {'>'}{' '}
                <span className="font-semibold text-accent">CONTROL</span>
              </motion.p>

              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Planejamento Estratégico</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-5 h-5 text-secondary" />
                  <span>Controle Total</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5 text-accent" />
                  <span>Gestão de Equipes</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Lead Capture Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Consultoria Gratuita</h3>
              <p className="text-muted-foreground">
                Agende sua análise de compliance sem compromisso
              </p>
              
              {/* Countdown Timer */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium mb-2">
                  Oferta válida por:
                </p>
                <div className="text-3xl font-bold text-destructive font-mono">
                  {formatTime(countdown)}
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Seu e-mail empresarial"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Telefone/WhatsApp"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <Button size="lg" className="w-full group">
                Agende sua Consultoria Gratuita
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button size="lg" variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp: (63) 99999-9999
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Seus dados estão protegidos conforme LGPD
            </p>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}