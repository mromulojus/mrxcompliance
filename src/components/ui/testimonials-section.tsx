import { TestimonialsSection as TestimonialsWithMarquee } from "@/components/ui/testimonials-with-marquee"

const testimonials = [
  {
    author: {
      name: "Ana Souza",
      handle: "@anasouza",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    text: "A plataforma tornou nossa análise de dados muito mais rápida e confiável. Recomendo!",
    href: "https://twitter.com/anasouza"
  },
  {
    author: {
      name: "Carlos Lima",
      handle: "@carlos.dev",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    text: "Integração simples e documentação clara. Reduzimos o tempo de desenvolvimento em 60%.",
    href: "https://twitter.com/carlosdev"
  },
  {
    author: {
      name: "Mariana Silva",
      handle: "@marianasilva",
      avatar: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?w=150&h=150&fit=crop&crop=face"
    },
    text: "Finalmente uma ferramenta de IA que entende o contexto! A precisão é impressionante."
  }
]

export function TestimonialsSection() {
  return (
    <TestimonialsWithMarquee
      title="O que nossos clientes dizem"
      description="Empresas confiam na nossa solução para acelerar resultados com qualidade e segurança."
      testimonials={testimonials}
    />
  )
}