import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, DollarSign, ArrowRight } from "lucide-react";

export function ROICalculator() {
  const [formData, setFormData] = useState({
    faturamento: '',
    custoNaoConformidade: '',
    tamanhoEquipe: ''
  });
  const [showResults, setShowResults] = useState(false);

  const calculateROI = () => {
    const faturamento = parseFloat(formData.faturamento) || 0;
    const custoNaoConformidade = parseFloat(formData.custoNaoConformidade) || 0;
    const investimentoCompliance = faturamento * 0.002; // 0.2% do faturamento
    
    const economiaAnual = custoNaoConformidade * 0.85; // 85% de redução
    const roiAnual = ((economiaAnual - investimentoCompliance) / investimentoCompliance) * 100;
    
    return {
      investimentoCompliance: investimentoCompliance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      economiaAnual: economiaAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      roiAnual: roiAnual.toFixed(0),
      payback: Math.round(12 / (economiaAnual / investimentoCompliance))
    };
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const results = showResults ? calculateROI() : null;

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Calculadora de <span className="text-primary">ROI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra o retorno do investimento em compliance para sua empresa
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border/50 rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Calcule sua Economia</h3>
                <p className="text-muted-foreground">Insira os dados da sua empresa</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Faturamento Anual (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5000000"
                  value={formData.faturamento}
                  onChange={(e) => setFormData({...formData, faturamento: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custos com Não Conformidade (R$/ano)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 500000"
                  value={formData.custoNaoConformidade}
                  onChange={(e) => setFormData({...formData, custoNaoConformidade: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Inclui multas, retrabalho, perda de negócios, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tamanho da Equipe
                </label>
                <select
                  value={formData.tamanhoEquipe}
                  onChange={(e) => setFormData({...formData, tamanhoEquipe: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="1-10">1-10 funcionários</option>
                  <option value="11-50">11-50 funcionários</option>
                  <option value="51-200">51-200 funcionários</option>
                  <option value="201-500">201-500 funcionários</option>
                  <option value="500+">Mais de 500 funcionários</option>
                </select>
              </div>

              <Button 
                onClick={handleCalculate}
                className="w-full group"
                disabled={!formData.faturamento || !formData.custoNaoConformidade}
              >
                Calcular Economia
                <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {showResults && results ? (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 space-y-6">
                <h3 className="text-2xl font-bold text-center mb-6">
                  Resultado da Análise
                </h3>

                {/* ROI Chart Simulation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{results.economiaAnual}</div>
                    <div className="text-sm text-muted-foreground">Economia Anual</div>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary">{results.roiAnual}%</div>
                    <div className="text-sm text-muted-foreground">ROI Anual</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Investimento</span>
                      <span>{results.investimentoCompliance}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-primary h-3 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Economia Projetada</span>
                      <span>{results.economiaAnual}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-secondary h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Tempo de Retorno</p>
                  <p className="text-2xl font-bold text-accent">{results.payback} meses</p>
                </div>

                <Button className="w-full group">
                  Solicitar Análise Detalhada
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            ) : (
              <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
                <Calculator className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aguardando Dados</h3>
                <p className="text-muted-foreground">
                  Preencha os campos ao lado para ver sua projeção de economia
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}