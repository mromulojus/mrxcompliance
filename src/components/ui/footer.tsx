import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="text-sm text-muted-foreground">
            © 2024 MRx Compliance. Sistema de Gestão de RH.
          </div>
        </div>
      </div>
    </footer>
  );
}