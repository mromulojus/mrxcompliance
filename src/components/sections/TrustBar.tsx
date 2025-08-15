import { motion } from "motion/react";
import { Badge, Star, Users, TrendingUp, Shield } from "lucide-react";

export function TrustBar() {
  const certifications = [
    { name: "ISO 37301", logo: "🏆" },
    { name: "COSO", logo: "📋" },
    { name: "OCDE", logo: "🌍" },
    { name: "CNMP", logo: "⚖️" },
    { name: "Google Partner", logo: "🔍" },
    { name: "Meta Partner", logo: "📘" }
  ];

  const metrics = [
    { icon: Users, value: "500+", label: "Clientes Atendidos", color: "text-primary" },
    { icon: TrendingUp, value: "98%", label: "Taxa de Recuperação", color: "text-secondary" },
    { icon: Star, value: "4.8/5", label: "Avaliação Média", color: "text-accent" }
  ];

  return (
    <section className="border-y bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Certificações e Parcerias</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 bg-background/50 border border-border/50 rounded-lg px-3 py-2 hover:bg-background/80 transition-colors"
                >
                  <span className="text-xl">{cert.logo}</span>
                  <span className="text-sm font-medium">{cert.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-6"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <metric.icon className={`w-8 h-8 mx-auto ${metric.color}`} />
                <div className="text-3xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}