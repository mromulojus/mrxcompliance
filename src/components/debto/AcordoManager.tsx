import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebtoData } from "@/hooks/useDebtoData";

interface Parcela {
  numero: number;
  valor: number;
  data_vencimento: Date;
  status: "pendente" | "pago" | "vencido";
}

interface AcordoManagerProps {
  dividaId: string;
  devedorId: string;
  valorOriginal: number;
  onAcordoCriado?: () => void;
}

export function AcordoManager({ dividaId, devedorId, valorOriginal, onAcordoCriado }: AcordoManagerProps) {
  const { adicionarHistorico, atualizarDivida } = useDebtoData();
  const [acordo, setAcordo] = useState({
    valor_total: valorOriginal,
    numero_parcelas: 1,
    valor_entrada: 0,
    data_entrada: new Date(),
    juros_mensal: 0,
    multa_atraso: 2,
    correcao_mensal: 1,
    forma_pagamento: "PIX",
    observacoes: ""
  });

  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const calcularParcelas = () => {
    const valorRestante = acordo.valor_total - acordo.valor_entrada;
    const valorParcela = valorRestante / acordo.numero_parcelas;
    
    const novasParcelas: Parcela[] = [];
    
    for (let i = 1; i <= acordo.numero_parcelas; i++) {
      const dataVencimento = new Date(acordo.data_entrada);
      dataVencimento.setMonth(dataVencimento.getMonth() + i);
      
      novasParcelas.push({
        numero: i,
        valor: valorParcela,
        data_vencimento: dataVencimento,
        status: "pendente"
      });
    }
    
    setParcelas(novasParcelas);
  };

  const adicionarParcela = () => {
    const ultimaParcela = parcelas[parcelas.length - 1];
    const novaDataVencimento = new Date(ultimaParcela?.data_vencimento || acordo.data_entrada);
    novaDataVencimento.setMonth(novaDataVencimento.getMonth() + 1);
    
    const novaParcela: Parcela = {
      numero: parcelas.length + 1,
      valor: 0,
      data_vencimento: novaDataVencimento,
      status: "pendente"
    };
    
    setParcelas([...parcelas, novaParcela]);
  };

  const removerParcela = (numero: number) => {
    setParcelas(parcelas.filter(p => p.numero !== numero));
  };

  const atualizarParcela = (numero: number, campo: keyof Parcela, valor: any) => {
    setParcelas(parcelas.map(p => 
      p.numero === numero ? { ...p, [campo]: valor } : p
    ));
  };

  const salvarAcordo = async () => {
    try {
      // Validações
      if (acordo.valor_total <= 0) {
        toast.error("Valor total do acordo deve ser maior que zero");
        return;
      }
      
      if (parcelas.length === 0) {
        toast.error("Adicione pelo menos uma parcela ao acordo");
        return;
      }

      // Simular salvamento no banco
      const acordoData = {
        divida_id: dividaId,
        valor_acordo: acordo.valor_total,
        valor_entrada: acordo.valor_entrada,
        data_vencimento_entrada: acordo.data_entrada,
        parcelas: acordo.numero_parcelas,
        forma_pagamento: acordo.forma_pagamento,
        observacoes: acordo.observacoes,
        status: "ativo"
      };

      console.log("Salvando acordo:", acordoData);
      
      // Atualizar status da dívida para "acordado"
      await atualizarDivida(dividaId, { status: 'acordado' }, false);
      
      // Criar histórico automático do acordo
      await adicionarHistorico({
        divida_id: dividaId,
        devedor_id: devedorId,
        tipo_acao: 'acordo',
        canal: 'sistema',
        descricao: `Acordo criado: ${formatCurrency(acordo.valor_total)} em ${acordo.numero_parcelas} parcelas`,
        resultado: 'sucesso',
        valor_negociado: acordo.valor_total,
        observacoes: `Forma de pagamento: ${acordo.forma_pagamento}. ${acordo.observacoes || ''}`
      });
      
      toast.success("Acordo criado com sucesso!");
      onAcordoCriado?.();
      
    } catch (error) {
      console.error("Erro ao salvar acordo:", error);
      toast.error("Erro ao criar acordo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Parâmetros do Acordo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Parâmetros do Acordo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor Total do Acordo</Label>
              <Input
                type="number"
                step="0.01"
                value={acordo.valor_total}
                onChange={(e) => setAcordo({...acordo, valor_total: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Valor de Entrada</Label>
              <Input
                type="number"
                step="0.01"
                value={acordo.valor_entrada}
                onChange={(e) => setAcordo({...acordo, valor_entrada: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                min="1"
                value={acordo.numero_parcelas}
                onChange={(e) => setAcordo({...acordo, numero_parcelas: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Juros Mensal (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={acordo.juros_mensal}
                onChange={(e) => setAcordo({...acordo, juros_mensal: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Multa por Atraso (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={acordo.multa_atraso}
                onChange={(e) => setAcordo({...acordo, multa_atraso: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Correção Mensal (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={acordo.correcao_mensal}
                onChange={(e) => setAcordo({...acordo, correcao_mensal: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Primeira Parcela</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !acordo.data_entrada && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {acordo.data_entrada ? format(acordo.data_entrada, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={acordo.data_entrada}
                    onSelect={(date) => {
                      if (date) {
                        setAcordo({...acordo, data_entrada: date});
                        setShowCalendar(false);
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={acordo.forma_pagamento} onValueChange={(value) => setAcordo({...acordo, forma_pagamento: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="BOLETO">Boleto</SelectItem>
                  <SelectItem value="CARTAO">Cartão</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={acordo.observacoes}
              onChange={(e) => setAcordo({...acordo, observacoes: e.target.value})}
              placeholder="Observações complementares sobre o acordo..."
            />
          </div>

          <Button onClick={calcularParcelas} variant="outline" className="w-full">
            Calcular Parcelas
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Parcelas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Parcelas do Acordo</CardTitle>
            <Button onClick={adicionarParcela} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Parcela
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {parcelas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma parcela adicionada. Clique em "Calcular Parcelas" ou "Adicionar Parcela".
            </p>
          ) : (
            <div className="space-y-3">
              {parcelas.map((parcela) => (
                <div key={parcela.numero} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">Parcela</Label>
                      <div className="font-medium">{parcela.numero}°</div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={parcela.valor}
                        onChange={(e) => atualizarParcela(parcela.numero, 'valor', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Vencimento</Label>
                      <Input
                        type="date"
                        value={format(parcela.data_vencimento, "yyyy-MM-dd")}
                        onChange={(e) => atualizarParcela(parcela.numero, 'data_vencimento', new Date(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Badge variant={
                        parcela.status === "pago" ? "default" : 
                        parcela.status === "vencido" ? "destructive" : "secondary"
                      }>
                        {parcela.status === "pago" ? "Pago" : 
                         parcela.status === "vencido" ? "Vencido" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerParcela(parcela.numero)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo e Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total do Acordo</p>
              <p className="text-2xl font-bold">{formatCurrency(acordo.valor_total)}</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                Cancelar
              </Button>
              <Button onClick={salvarAcordo}>
                Criar Acordo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}