import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Etiqueta {
  id: string;
  nome: string;
  cor: string;
}

interface EtiquetasDisplayProps {
  etiquetaIds: string[];
  maxDisplay?: number;
}

export function EtiquetasDisplay({ etiquetaIds, maxDisplay = 3 }: EtiquetasDisplayProps) {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);

  useEffect(() => {
    if (etiquetaIds.length > 0) {
      fetchEtiquetas();
    }
  }, [etiquetaIds]);

  const fetchEtiquetas = async () => {
    try {
      const { data, error } = await supabase
        .from('etiquetas_templates')
        .select('id, nome, cor')
        .in('id', etiquetaIds);

      if (error) throw error;
      setEtiquetas(data || []);
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error);
    }
  };

  if (etiquetas.length === 0) return null;

  const etiquetasExibidas = etiquetas.slice(0, maxDisplay);
  const etiquetasRestantes = etiquetas.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {etiquetasExibidas.map((etiqueta) => (
        <Badge
          key={etiqueta.id}
          variant="outline"
          style={{ 
            backgroundColor: etiqueta.cor + '20', 
            color: etiqueta.cor,
            borderColor: etiqueta.cor + '40'
          }}
          className="text-xs"
        >
          {etiqueta.nome}
        </Badge>
      ))}
      
      {etiquetasRestantes > 0 && (
        <Badge variant="outline" className="text-xs">
          +{etiquetasRestantes}
        </Badge>
      )}
    </div>
  );
}