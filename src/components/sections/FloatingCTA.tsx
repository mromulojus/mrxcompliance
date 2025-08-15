import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Phone, Mail, ArrowRight } from "lucide-react";

export function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    interesse: ''
  });

  // Exit Intent Detection
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent) {
        timeout = setTimeout(() => {
          setShowExitIntent(true);
          setIsOpen(true);
        }, 500);
      }
    };

    const handleMouseEnter = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (timeout) clearTimeout(timeout);
    };
  }, [showExitIntent]);

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Aqui você enviaria os dados do formulário
    console.log('Enviando dados:', formData);
    setIsOpen(false);
    setCurrentStep(1);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      interesse: ''
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Vamos conversar?</h3>
            <p className="text-sm text-muted-foreground">
              Primeiro, me conte um pouco sobre você
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Seu nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                placeholder="Empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Como podemos ajudar?</h3>
            <p className="text-sm text-muted-foreground">
              Qual é seu principal interesse?
            </p>
            <div className="space-y-2">
              {[
                'Programa de Compliance',
                'Consultoria ESG',
                'Governança Corporativa',
                'Sistema de Ouvidoria',
                'Programa de Integridade',
                'Outro'
              ].map((interesse) => (
                <button
                  key={interesse}
                  onClick={() => setFormData({...formData, interesse})}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.interesse === interesse
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {interesse}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Quase lá!</h3>
            <p className="text-sm text-muted-foreground">
              Como prefere que entremos em contato?
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="tel"
                placeholder="WhatsApp (opcional)"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl group"
        >
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
        </Button>

        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">MRx Compliance</div>
                  <div className="text-xs opacity-90">Online agora</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              {showExitIntent && currentStep === 1 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-destructive">
                    🎯 Aguarde! Oferta especial para você
                  </p>
                  <p className="text-xs text-destructive/80">
                    Consultoria gratuita disponível hoje
                  </p>
                </div>
              )}

              {renderStep()}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-xs text-muted-foreground">
                  Etapa {currentStep} de 3
                </div>
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                      Voltar
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button 
                      size="sm" 
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && (!formData.nome || !formData.empresa)) ||
                        (currentStep === 2 && !formData.interesse)
                      }
                    >
                      Próximo
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={handleSubmit}
                      disabled={!formData.email}
                    >
                      Enviar
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-border/50 mt-4 pt-4">
                <p className="text-xs text-muted-foreground mb-3">Ou fale conosco diretamente:</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/5563999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="tel:+5563999999999"
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Ligar</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}