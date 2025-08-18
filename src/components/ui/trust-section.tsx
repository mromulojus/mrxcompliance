import React from "react";

export function TrustSection() {
  const logos = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];

  return (
    <section className="py-12 md:py-16 bg-transparent" id="confianca">
      <div className="container mx-auto px-4">
        <p className="text-center text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Empresas de todos os portes confiam na nossa metodologia para construir um futuro mais seguro e ético.
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
          {logos.map((src, idx) => (
            <div key={idx} className="flex items-center justify-center">
              <img src={src} alt={`Logo ${idx + 1}`} className="h-10 opacity-60 hover:opacity-90 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustSection;

