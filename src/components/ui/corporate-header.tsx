import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./logo";

export function CorporateHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/sobre" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </Link>
          <Link to="/servicos" className="text-muted-foreground hover:text-foreground transition-colors">
            Serviços
          </Link>
          <Link to="/metodologia" className="text-muted-foreground hover:text-foreground transition-colors">
            Metodologia
          </Link>
          <Link to="/casos" className="text-muted-foreground hover:text-foreground transition-colors">
            Casos de Sucesso
          </Link>
          <Link to="/contato" className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="https://wa.me/5563999999999" target="_blank" rel="noopener noreferrer">
              <Phone className="w-4 h-4 mr-2" />
              (63) 99999-9999
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth">
              Login Plataforma
            </Link>
          </Button>
          <Button size="sm" variant="secondary">
            Agende Diagnóstico
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="tel:+5563999999999">
              <Phone className="w-4 h-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              to="/sobre" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link 
              to="/servicos" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Serviços
            </Link>
            <Button className="w-full" asChild>
              <Link to="/auth">
                Login Plataforma
              </Link>
            </Button>
            <Button className="w-full" variant="secondary">
              Agende Diagnóstico
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}