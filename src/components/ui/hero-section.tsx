import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Tenha um Sistema{' '}
                <span className="text-primary">Sob Medida</span>{' '}
                para Seu Negócio
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Soluções completas de compliance, gestão de débitos e processos judiciais 
                em uma plataforma integrada e inteligente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link to="/auth">
                  QUERO MAIS INFORMAÇÕES
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Gestão de Compliance</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Controle de Débitos</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Processos Judiciais</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Dashboards Inteligentes</span>
              </div>
            </div>
          </div>

          {/* Corporate Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-muted">
              <img
                src="/lovable-uploads/84bc1c20-be7d-4c41-b05f-05ad9168feda.png"
                alt="Profissional executivo em ambiente corporativo"
                className="w-full h-[500px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" />
    </section>
  );
}