import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Plus, TrendingUp, Calculator } from "lucide-react";
import { toast } from "sonner";

interface Parcela {
  id: string;
  numero: number;
  valor: number;
  data_vencimento: string;
  status: "pendente" | "pago" | "vencido";
}

interface CorrecaoValoresProps {
  valorOriginal: number;
  dataVencimento: string;
  onValorAtualizado?: (valor: number) => void;
}

export function CorrecaoValores({ valorOriginal, dataVencimento, onValorAtualizado }: CorrecaoValoresProps) {
  const [indiceCorrecao, setIndiceCorrecao] = useState("IPCA");
  const [percentualPersonalizado, setPercentualPersonalizado] = useState<number>(0);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [valorAtualizado, setValorAtualizado] = useState(valorOriginal);

  const indicesCorrecao = [
    { value: "IPCA", label: "IPCA - Índice de Preços ao Consumidor Amplo", taxa: 4.62 },
    { value: "IPCA-E", label: "IPCA-E - Índice de Preços ao Consumidor Amplo Especial", taxa: 4.85 },
    { value: "IGP-M", label: "IGP-M - Índice Geral de Preços do Mercado", taxa: 5.12 },
    { value: "IGP-DI", label: "IGP-DI - Índice Geral de Preços - Disponibilidade Interna", taxa: 5.08 },
    { value: "IPC", label: "IPC - Índice de Preços ao Consumidor", taxa: 4.72 },
    { value: "INPC", label: "INPC - Índice Nacional de Preços ao Consumidor", taxa: 4.58 },
    { value: "CDI", label: "CDI - Certificado de Depósito Interbancário", taxa: 13.75 },
    { value: "SELIC", label: "SELIC - Taxa Básica de Juros", taxa: 13.25 },
    { value: "TJLP", label: "TJLP - Taxa de Juros de Longo Prazo", taxa: 7.50 },
    { value: "TR", label: "TR - Taxa Referencial", taxa: 0.17 },
    { value: "PERSONALIZADO", label: "Taxa Personalizada", taxa: 0 }
  ];

  const calcularValorAtualizado = () => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (diasAtraso === 0) {
      setValorAtualizado(valorOriginal);
      onValorAtualizado?.(valorOriginal);
      return;
    }

    const indiceEscolhido = indicesCorrecao.find(i => i.value === indiceCorrecao);
    const taxaAnual = indiceEscolhido?.value === "PERSONALIZADO" ? percentualPersonalizado : (indiceEscolhido?.taxa || 0);
    
    // Aplicar correção (taxa anual convertida para mensal)
    const taxaMensal = taxaAnual / 12 / 100;
    const mesesAtraso = diasAtraso / 30;
    
    // Fórmula: Valor = ValorOriginal * (1 + taxa)^tempo
    const valorCorrigido = valorOriginal * Math.pow((1 + taxaMensal), mesesAtraso);
    
    // Adicionar multa de 2% e juros de 1% ao mês
    const multa = valorOriginal * 0.02;
    const juros = valorOriginal * 0.01 * mesesAtraso;
    
    const valorFinal = valorCorrigido + multa + juros;
    
    setValorAtualizado(valorFinal);
    onValorAtualizado?.(valorFinal);
    
    toast.success(`Valor atualizado calculado: ${formatCurrency(valorFinal)}`);
  };

  const adicionarParcela = () => {
    const novaParcela: Parcela = {
      id: Date.now().toString(),
      numero: parcelas.length + 1,
      valor: 0,
      data_vencimento: new Date().toISOString().split('T')[0],
      status: "pendente"
    };
    
    setParcelas([...parcelas, novaParcela]);
  };

  const removerParcela = (id: string) => {
    setParcelas(parcelas.filter(p => p.id !== id));
    // Renumerar parcelas
    const parcelasAtualizadas = parcelas
      .filter(p => p.id !== id)
      .map((p, index) => ({ ...p, numero: index + 1 }));
    setParcelas(parcelasAtualizadas);
  };

  const atualizarParcela = (id: string, campo: keyof Parcela, valor: any) => {
    setParcelas(parcelas.map(p => 
      p.id === id ? { ...p, [campo]: valor } : p
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago": return "bg-green-100 text-green-800";
      case "vencido": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Correção de Valores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Correção de Valores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Original</Label>
              <div className="text-lg font-semibold text-muted-foreground">
                {formatCurrency(valorOriginal)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Valor Atualizado</Label>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(valorAtualizado)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Índice de Correção</Label>
            <Select value={indiceCorrecao} onValueChange={setIndiceCorrecao}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {indicesCorrecao.map((indice) => (
                  <SelectItem key={indice.value} value={indice.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{indice.label}</span>
                      {indice.value !== "PERSONALIZADO" && (
                        <span className="text-sm text-muted-foreground ml-2">
                          {indice.taxa}% a.a.
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {indiceCorrecao === "PERSONALIZADO" && (
            <div className="space-y-2">
              <Label>Taxa Personalizada (% ao ano)</Label>
              <Input
                type="number"
                step="0.01"
                value={percentualPersonalizado}
                onChange={(e) => setPercentualPersonalizado(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          )}

          <Button onClick={calcularValorAtualizado} className="w-full gap-2">
            <Calculator className="h-4 w-4" />
            Calcular Valor Atualizado
          </Button>
        </CardContent>
      </Card>

      {/* Sistema de Parcelas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Parcelas
            </CardTitle>
            <Button onClick={adicionarParcela} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Parcela
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {parcelas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma parcela adicionada</p>
              <p className="text-sm">Clique em "Adicionar Parcela" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parcelas.map((parcela) => (
                <div key={parcela.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg items-end">
                  <div className="space-y-2">
                    <Label className="text-xs">Parcela</Label>
                    <div className="h-10 flex items-center font-medium">
                      {parcela.numero}°
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parcela.valor}
                      onChange={(e) => atualizarParcela(parcela.id, 'valor', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Data de Vencimento</Label>
                    <Input
                      type="date"
                      value={parcela.data_vencimento}
                      onChange={(e) => atualizarParcela(parcela.id, 'data_vencimento', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <Select 
                      value={parcela.status} 
                      onValueChange={(value) => atualizarParcela(parcela.id, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="pendente">
                          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                        </SelectItem>
                        <SelectItem value="pago">
                          <Badge className="bg-green-100 text-green-800">Pago</Badge>
                        </SelectItem>
                        <SelectItem value="vencido">
                          <Badge className="bg-red-100 text-red-800">Vencido</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removerParcela(parcela.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Resumo das Parcelas */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total das Parcelas:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(parcelas.reduce((sum, p) => sum + p.valor, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}