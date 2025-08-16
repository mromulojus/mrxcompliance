import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/cbe050ae-bdf6-4931-86b4-d8e69e8995af.png" 
            alt="Logo" 
            className="h-8 w-8"
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
            to="/sobre"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sobre
          </Link>
          <Link
            to="/servicos"
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
          <Link to="/dashboard">
            Login
          </Link>
        </Button>
      </div>
    </header>
  );
}