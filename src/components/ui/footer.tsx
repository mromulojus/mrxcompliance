export function Footer() {
  return <footer className="border-t bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center space-x-2">
            <img src="/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png" alt="MRxCompliance Logo" className="h-6 w-6 object-contain" />
            <span className="text-sm font-semibold text-foreground">MRX Compliance</span>
          </div>
          <nav className="text-xs md:text-sm justify-center flex gap-4 text-muted-foreground">
            <a href="/home#empresas" className="hover:text-foreground">Nossas Empresas</a>
            <a href="/home#metodo" className="hover:text-foreground">Metodologia</a>
            <a href="/home#blog" className="hover:text-foreground">Blog</a>
            <a href="/home#contato" className="hover:text-foreground">Contato</a>
          </nav>
          <div className="text-xs md:text-sm text-muted-foreground md:text-right">
            <div>CONTATO@MRXBR.COM • Telefone: (xx) xxxxx-xxxx</div>
            <div className="mt-1">© 2024 MRX Compliance. Todos os direitos reservados.</div>
          </div>
        </div>
      </div>
    </footer>;
}