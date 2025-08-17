export function Footer() {
  return (
    <footer className="border-t bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png" 
              alt="MRxCompliance Logo" 
              className="h-6 w-6 object-contain"
            />
            <span className="text-sm font-semibold text-foreground">MRxCOMPLIANCE</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 MRx Compliance. Sistema de Gestão de RH.
          </div>
        </div>
      </div>
    </footer>
  );
}