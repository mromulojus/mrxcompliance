import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarioEventos } from '@/components/processos/CalendarioEventos';
import { useHR } from '@/context/HRContext';

const Calendario: React.FC = () => {
  const { empresas, empresaSelecionada, selecionarEmpresa } = useHR();

  const effectiveEmpresaId = useMemo(() => {
    if (empresaSelecionada) return empresaSelecionada;
    return empresas.length > 0 ? empresas[0].id : null;
  }, [empresaSelecionada, empresas]);

  if (!effectiveEmpresaId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          Nenhuma empresa cadastrada. Cadastre uma empresa para usar o calendário.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <Select
              value={effectiveEmpresaId}
              onValueChange={(value) => selecionarEmpresa(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <CalendarioEventos empresaId={effectiveEmpresaId} />
    </div>
  );
};

export default Calendario;

