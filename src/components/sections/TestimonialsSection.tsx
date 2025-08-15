import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Play, Quote, ArrowLeft, ArrowRight, Building, Users } from "lucide-react";

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const videoTestimonials = [
    {
      id: 1,
      thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
      title: "CEO da TechCorp",
      name: "João Silva",
      company: "TechCorp Solutions",
      role: "CEO",
      content: "A implementação do compliance pela MRx transformou nossa operação. Reduzimos riscos em 90% e aumentamos a confiança dos investidores.",
      results: "90% redução de riscos",
      rating: 5
    },
    {
      id: 2,
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      title: "Diretora Financeira",
      name: "Maria Santos",
      company: "IndustrialMax",
      role: "CFO",
      content: "Em apenas 6 meses conseguimos certificação ISO 37301. O ROI foi de 340% no primeiro ano. Metodologia excepcional.",
      results: "340% ROI no primeiro ano",
      rating: 5
    },
    {
      id: 3,
      thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
      title: "Presidente da ONG",
      name: "Carlos Oliveira",
      company: "Instituto Verde",
      role: "Presidente",
      content: "A consultoria ESG nos posicionou como referência no setor. Captamos 200% mais recursos após a implementação das práticas.",
      results: "200% aumento na captação",
      rating: 5
    }
  ];

  const textTestimonials = [
    {
      name: "Ana Costa",
      role: "Gerente de Compliance",
      company: "Banco Regional",
      content: "Sistema de ouvidoria implementado em tempo recorde. Aumentou nossa nota no ranking de transparência.",
      rating: 5,
      sector: "Financeiro"
    },
    {
      name: "Roberto Lima",
      role: "Diretor Jurídico",
      company: "Construtora Alfa",
      content: "Due diligence de terceiros evitou problemas significativos. Economia estimada de R$ 2 milhões.",
      rating: 5,
      sector: "Construção"
    },
    {
      name: "Fernanda Cruz",
      role: "Head de RH",
      company: "StartupTech",
      content: "Programa de integridade adaptado para startup. Crescemos 300% mantendo conformidade total.",
      rating: 5,
      sector: "Tecnologia"
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % videoTestimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Resultados <span className="text-primary">Comprovados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empresas que transformaram suas operações com nossa metodologia
          </p>
        </motion.div>

        {/* Video Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video Player */}
            <div className="relative">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden relative group cursor-pointer">
                <img
                  src={videoTestimonials[activeTestimonial].thumbnail}
                  alt={videoTestimonials[activeTestimonial].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {videoTestimonials[activeTestimonial].title}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="icon" onClick={prevTestimonial}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-2">
                  {videoTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === activeTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <Button variant="outline" size="icon" onClick={nextTestimonial}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-1">
                {renderStars(videoTestimonials[activeTestimonial].rating)}
              </div>

              <Quote className="w-8 h-8 text-primary/30" />

              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed">
                "{videoTestimonials[activeTestimonial].content}"
              </blockquote>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Resultado Alcançado</p>
                <p className="text-xl font-bold text-primary">
                  {videoTestimonials[activeTestimonial].results}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">
                    {videoTestimonials[activeTestimonial].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {videoTestimonials[activeTestimonial].role} • {videoTestimonials[activeTestimonial].company}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Mais Depoimentos de Sucesso
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {textTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border/50 rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                <blockquote className="text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    {testimonial.sector}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button size="lg" className="group">
            Quero Resultados Como Estes
            <Users className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}