import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { useDebtoData } from "@/hooks/useDebtoData";

interface EmpresaTagProps {
  empresaId: string;
  variant?: "default" | "outline" | "secondary";
}

export function EmpresaTag({ empresaId, variant = "outline" }: EmpresaTagProps) {
  const { empresas } = useDebtoData();
  
  const empresa = empresas.find(e => e.id === empresaId);
  
  if (!empresa) {
    return (
      <Badge variant={variant} className="text-xs">
        <Building2 className="w-3 h-3 mr-1" />
        Empresa não encontrada
      </Badge>
    );
  }
  
  return (
    <Badge variant={variant} className="text-xs">
      <Building2 className="w-3 h-3 mr-1" />
      {empresa.nome}
    </Badge>
  );
}