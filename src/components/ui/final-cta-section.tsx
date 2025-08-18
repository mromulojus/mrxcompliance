import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function FinalCTASection() {
  return (
    <section className="relative py-16 md:py-24" id="diagnostico">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_400px_at_50%_-10%,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 p-8 md:p-10 shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Pronto para blindar seu negócio?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Não deixe a segurança jurídica da sua empresa ao acaso. Agende um diagnóstico e descubra como o Protocolo MRX pode transformar seu negócio.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <a href="mailto:CONTATO@MRXBR.COM" className={cn(buttonVariants({ size: "lg" }))}>
              Falar com um Especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTASection;

