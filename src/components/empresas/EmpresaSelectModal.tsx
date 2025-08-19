import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Empresa {
  id: string;
  nome: string;
}

interface EmpresaSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (empresa: Empresa | null) => void;
  selectedEmpresaId?: string;
  allowClear?: boolean;
}

export function EmpresaSelectModal({ open, onOpenChange, onSelect, selectedEmpresaId, allowClear = true }: EmpresaSelectModalProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nome')
          .order('nome');
        if (error) throw error;
        setEmpresas((data as Empresa[]) || []);
      } finally {
        setLoading(false);
      }
    };
    if (open) void fetch();
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter(e => e.nome.toLowerCase().includes(q) || e.id.includes(q));
  }, [empresas, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Vincular Empresa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Buscar por nome ou ID da empresa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {allowClear && (
            <Button variant="outline" className="w-full" onClick={() => { onSelect(null); onOpenChange(false); }}>
              Remover vínculo de empresa
            </Button>
          )}
          <ScrollArea className="max-h-80 pr-4">
            <div className="space-y-2">
              {loading && (
                <div className="text-sm text-muted-foreground">Carregando empresas...</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhuma empresa encontrada</div>
              )}
              {!loading && filtered.map((empresa) => (
                <Button
                  key={empresa.id}
                  variant={empresa.id === selectedEmpresaId ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => { onSelect(empresa); onOpenChange(false); }}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{empresa.nome}</div>
                    <div className="text-[11px] text-muted-foreground">{empresa.id}</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

