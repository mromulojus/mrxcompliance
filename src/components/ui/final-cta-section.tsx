import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function FinalCTASection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30" id="diagnostico">
      <div className="container mx-auto px-4 text-center">
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
    </section>
  );
}

export default FinalCTASection;

