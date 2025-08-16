import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useProcessosData } from '@/hooks/useProcessosData';

interface ProcessoValoresProps {
  processoId: string;
}

export function ProcessoValores({ processoId }: ProcessoValoresProps) {
  const { valores, fetchValores } = useProcessosData();
  const [tipoFilter, setTipoFilter] = useState<string>('');

  useEffect(() => {
    if (processoId) {
      fetchValores(processoId);
    }
  }, [processoId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      'honorario': 'bg-green-100 text-green-800',
      'despesa': 'bg-red-100 text-red-800',
      'valor_processo': 'bg-blue-100 text-blue-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'honorario': 'Honorário',
      'despesa': 'Despesa',
      'valor_processo': 'Valor do Processo'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      'honorario': TrendingUp,
      'despesa': TrendingDown,
      'valor_processo': DollarSign
    };
    const IconComponent = icons[tipo as keyof typeof icons] || DollarSign;
    return <IconComponent className="h-4 w-4" />;
  };

  const calcularTotais = () => {
    const filteredValores = tipoFilter 
      ? valores.filter(v => v.tipo === tipoFilter)
      : valores;

    const total = filteredValores.reduce((sum, v) => sum + v.valor, 0);
    const pago = filteredValores.filter(v => v.pago).reduce((sum, v) => sum + v.valor, 0);
    const pendente = total - pago;
    const vencidos = filteredValores.filter(v => 
      !v.pago && v.data_vencimento && new Date(v.data_vencimento) < new Date()
    ).reduce((sum, v) => sum + v.valor, 0);

    const honorarios = valores.filter(v => v.tipo === 'honorario').reduce((sum, v) => sum + v.valor, 0);
    const despesas = valores.filter(v => v.tipo === 'despesa').reduce((sum, v) => sum + v.valor, 0);
    const valoresProcesso = valores.filter(v => v.tipo === 'valor_processo').reduce((sum, v) => sum + v.valor, 0);

    return {
      total,
      pago,
      pendente,
      vencidos,
      honorarios,
      despesas,
      valoresProcesso
    };
  };

  const totais = calcularTotais();
  const filteredValores = tipoFilter 
    ? valores.filter(v => v.tipo === tipoFilter)
    : valores;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Valores e Honorários</h3>
          <p className="text-sm text-muted-foreground">
            Controle financeiro completo do processo
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Valor
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Geral</p>
                <p className="text-2xl font-bold">{formatCurrency(totais.total)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Honorários</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.honorarios)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totais.despesas)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totais.pendente)}</p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button 
              variant={tipoFilter === '' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTipoFilter('')}
            >
              Todos
            </Button>
            <Button 
              variant={tipoFilter === 'honorario' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTipoFilter('honorario')}
            >
              Honorários
            </Button>
            <Button 
              variant={tipoFilter === 'despesa' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTipoFilter('despesa')}
            >
              Despesas
            </Button>
            <Button 
              variant={tipoFilter === 'valor_processo' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTipoFilter('valor_processo')}
            >
              Valores do Processo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Valores */}
      <div className="grid gap-4">
        {filteredValores.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum valor encontrado</h4>
              <p className="text-muted-foreground mb-4">
                {tipoFilter 
                  ? `Nenhum ${getTipoLabel(tipoFilter).toLowerCase()} registrado`
                  : 'Adicione o primeiro valor para este processo'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Valor
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredValores.map((valor) => (
            <Card key={valor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTipoColor(valor.tipo)}`}>
                        {getTipoIcon(valor.tipo)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">
                            {valor.descricao}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTipoColor(valor.tipo)}>
                              {getTipoLabel(valor.tipo)}
                            </Badge>
                            <Badge variant={valor.pago ? 'default' : 'secondary'}>
                              {valor.pago ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Pago</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" /> Pendente</>
                              )}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {formatCurrency(valor.valor)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {valor.data_vencimento && (
                          <div>
                            <span className="font-medium text-muted-foreground">Vencimento:</span>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(valor.data_vencimento).toLocaleDateString('pt-BR')}
                              {!valor.pago && new Date(valor.data_vencimento) < new Date() && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  Vencido
                                </Badge>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {valor.data_pagamento && (
                          <div>
                            <span className="font-medium text-muted-foreground">Data do Pagamento:</span>
                            <p>{new Date(valor.data_pagamento).toLocaleDateString('pt-BR')}</p>
                          </div>
                        )}
                        
                        {valor.forma_pagamento && (
                          <div>
                            <span className="font-medium text-muted-foreground">Forma de Pagamento:</span>
                            <p>{valor.forma_pagamento}</p>
                          </div>
                        )}
                      </div>
                      
                      {valor.observacoes && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <strong>Observações:</strong> {valor.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo Final */}
      {filteredValores.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatCurrency(totais.total)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pago</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totais.pago)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(totais.pendente)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Vencido</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totais.vencidos)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}