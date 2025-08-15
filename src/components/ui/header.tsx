import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logoGold from "@/assets/logo-gold.png";
import logoDark from "@/assets/logo-dark.png";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={logoGold} 
            alt="Logo" 
            className="h-8 w-8 dark:hidden"
          />
          <img 
            src={logoDark} 
            alt="Logo" 
            className="h-8 w-8 hidden dark:block"
          />
          <span className="text-xl font-bold text-foreground">
            PLAN>CHECK>CONTROL
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link to="/sobre" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </Link>
          <Link to="/servicos" className="text-muted-foreground hover:text-foreground transition-colors">
            Serviços
          </Link>
          <Link to="/contato" className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </Link>
        </nav>

        <Button asChild variant="default">
          <Link to="/auth">
            Login
          </Link>
        </Button>
      </div>
    </header>
  );
}