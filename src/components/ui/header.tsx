import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png" 
            alt="MRxCompliance Logo" 
            className="h-12 w-12 object-contain"
          />
          <span className="text-xl font-bold text-foreground">
            MRxCOMPLIANCE
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {!user && (
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
          )}
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/home#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Serviços
          </Link>
          <Link
            to="/contato"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contato
          </Link>
        </nav>

        <Button asChild variant="default">
          <Link to="/denuncias/consulta">
            Consultar Denúncia
          </Link>
        </Button>
      </div>
    </header>
  );
}
