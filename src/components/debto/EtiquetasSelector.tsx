import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, Plus, X, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Etiqueta {
  id: string;
  nome: string;
  cor: string;
}

interface EtiquetasSelectorProps {
  selectedEtiquetas: string[];
  onSelectionChange: (etiquetas: string[]) => void;
  tipo: "devedor" | "divida" | "ambos";
  empresaId?: string;
}

export function EtiquetasSelector({ 
  selectedEtiquetas, 
  onSelectionChange, 
  tipo,
  empresaId 
}: EtiquetasSelectorProps) {
  const [etiquetasDisponiveis, setEtiquetasDisponiveis] = useState<Etiqueta[]>([]);
  const [open, setOpen] = useState(false);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");
  const [corNovaEtiqueta, setCorNovaEtiqueta] = useState("#3b82f6");

  useEffect(() => {
    fetchEtiquetas();
  }, [tipo, empresaId]);

  const fetchEtiquetas = async () => {
    try {
      let query = supabase
        .from('etiquetas_templates')
        .select('*')
        .in('tipo', [tipo, 'ambos']);

      if (empresaId) {
        query = query.or(`empresa_id.eq.${empresaId},empresa_id.is.null`);
      } else {
        query = query.is('empresa_id', null);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setEtiquetasDisponiveis(data || []);
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error);
      toast.error('Erro ao carregar etiquetas');
    }
  };

  const handleToggleEtiqueta = (etiquetaId: string) => {
    if (selectedEtiquetas.includes(etiquetaId)) {
      onSelectionChange(selectedEtiquetas.filter(id => id !== etiquetaId));
    } else {
      onSelectionChange([...selectedEtiquetas, etiquetaId]);
    }
  };

  const handleCriarEtiqueta = async () => {
    if (!novaEtiqueta.trim()) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('etiquetas_templates')
        .insert({
          nome: novaEtiqueta.trim(),
          cor: corNovaEtiqueta,
          tipo,
          empresa_id: empresaId || null,
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setEtiquetasDisponiveis([...etiquetasDisponiveis, data]);
      setNovaEtiqueta("");
      setCorNovaEtiqueta("#3b82f6");
      toast.success('Etiqueta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
      toast.error('Erro ao criar etiqueta');
    }
  };

  const getEtiquetaNome = (id: string) => {
    const etiqueta = etiquetasDisponiveis.find(e => e.id === id);
    return etiqueta?.nome || 'Etiqueta removida';
  };

  const getEtiquetaCor = (id: string) => {
    const etiqueta = etiquetasDisponiveis.find(e => e.id === id);
    return etiqueta?.cor || '#gray';
  };

  return (
    <div className="space-y-2">
      <Label>Etiquetas</Label>
      
      {/* Etiquetas Selecionadas */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
        {selectedEtiquetas.length > 0 ? (
          selectedEtiquetas.map((etiquetaId) => (
            <Badge 
              key={etiquetaId} 
              variant="secondary"
              style={{ backgroundColor: getEtiquetaCor(etiquetaId) + '20', color: getEtiquetaCor(etiquetaId) }}
              className="flex items-center gap-1"
            >
              {getEtiquetaNome(etiquetaId)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => handleToggleEtiqueta(etiquetaId)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Nenhuma etiqueta selecionada</span>
        )}
      </div>

      {/* Seletor de Etiquetas */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Tag className="w-4 h-4 mr-2" />
            Selecionar Etiquetas
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <Command>
            <CommandInput placeholder="Buscar etiquetas..." />
            <CommandEmpty>Nenhuma etiqueta encontrada.</CommandEmpty>
            <CommandGroup>
              {etiquetasDisponiveis.map((etiqueta) => (
                <CommandItem
                  key={etiqueta.id}
                  onSelect={() => handleToggleEtiqueta(etiqueta.id)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedEtiquetas.includes(etiqueta.id) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Badge 
                    variant="outline" 
                    style={{ backgroundColor: etiqueta.cor + '20', color: etiqueta.cor }}
                    className="mr-2"
                  >
                    {etiqueta.nome}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>

          {/* Criar Nova Etiqueta */}
          <div className="mt-4 p-3 border-t space-y-2">
            <Label className="text-xs font-medium">Criar Nova Etiqueta</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da etiqueta"
                value={novaEtiqueta}
                onChange={(e) => setNovaEtiqueta(e.target.value)}
                className="flex-1"
              />
              <Input
                type="color"
                value={corNovaEtiqueta}
                onChange={(e) => setCorNovaEtiqueta(e.target.value)}
                className="w-16"
              />
            </div>
            <Button 
              size="sm" 
              onClick={handleCriarEtiqueta} 
              disabled={!novaEtiqueta.trim()}
              className="w-full"
            >
              <Plus className="w-3 h-3 mr-1" />
              Criar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}