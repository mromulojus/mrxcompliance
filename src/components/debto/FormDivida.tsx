import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Calendar, TrendingUp } from "lucide-react";
import { useDebtoData } from "@/hooks/useDebtoData";
import { toast } from "sonner";

const dividaSchema = z.object({
  empresa_id: z.string().min(1, "Empresa é obrigatória"),
  devedor_id: z.string().min(1, "Devedor é obrigatório"),
  origem_divida: z.string().min(1, "Origem da dívida é obrigatória"),
  numero_contrato: z.string().optional(),
  numero_nf: z.string().optional(),
  data_vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  valor_original: z.number().min(0.01, "Valor deve ser maior que zero"),
  status: z.enum(['pendente', 'negociacao', 'acordado', 'pago', 'judicial', 'negativado', 'protestado', 'cancelado']),
  estagio: z.enum(['vencimento_proximo', 'vencido', 'negociacao', 'formal', 'judicial']),
  // Índices personalizados
  multa_personalizada: z.number().min(0).max(100).optional(),
  juros_personalizado: z.number().min(0).max(100).optional(),
  correcao_personalizada: z.number().min(0).max(100).optional(),
  permitir_parcelamento: z.boolean().optional(),
  max_parcelas: z.number().min(1).max(60).optional()
});

type DividaFormData = z.infer<typeof dividaSchema>;

interface FormDividaProps {
  onSuccess?: () => void;
}

export function FormDivida({ onSuccess }: FormDividaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { empresas, devedores, adicionarDivida } = useDebtoData();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DividaFormData>({
    resolver: zodResolver(dividaSchema),
    defaultValues: {
      status: 'pendente',
      estagio: 'vencimento_proximo'
    }
  });

  const selectedEmpresa = watch('empresa_id');
  const valorOriginal = watch('valor_original');
  const multaPersonalizada = watch('multa_personalizada');
  const jurosPersonalizado = watch('juros_personalizado');
  const correcaoPersonalizada = watch('correcao_personalizada');
  const permitirParcelamento = watch('permitir_parcelamento');

  // Filtrar devedores pela empresa selecionada
  const devedoresFiltrados = devedores.filter(d => d.empresa_id === selectedEmpresa);

  const calcularValorAtualizado = (valorOriginal: number, dataVencimento: string, customMulta?: number, customJuros?: number, customCorrecao?: number) => {
    if (!valorOriginal || !dataVencimento) return valorOriginal || 0;

    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));

    if (diasAtraso === 0) return valorOriginal;

    // Usar valores personalizados ou padrão
    const percentualMulta = (customMulta ?? 2) / 100;
    const percentualJuros = (customJuros ?? 1) / 100;
    const percentualCorrecao = (customCorrecao ?? 1.5) / 100;

    const multa = valorOriginal * percentualMulta;
    const juros = valorOriginal * percentualJuros * (diasAtraso / 30);
    const correcao = valorOriginal * percentualCorrecao * (diasAtraso / 30);

    return valorOriginal + multa + juros + correcao;
  };

  const calcularUrgencyScore = (dataVencimento: string, valor: number) => {
    if (!dataVencimento || !valor) return 0;

    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

    let score = 0;

    // Score baseado em dias de atraso
    if (diasAtraso > 90) score += 40;
    else if (diasAtraso > 60) score += 30;
    else if (diasAtraso > 30) score += 20;
    else if (diasAtraso > 0) score += 10;

    // Score baseado no valor
    if (valor > 10000) score += 30;
    else if (valor > 5000) score += 20;
    else if (valor > 1000) score += 10;

    // Score baseado na proximidade do vencimento (para dívidas futuras)
    if (diasAtraso <= 0) {
      const diasParaVencimento = Math.abs(diasAtraso);
      if (diasParaVencimento <= 7) score += 20;
      else if (diasParaVencimento <= 15) score += 10;
    }

    return Math.min(100, score);
  };

  const onSubmit = async (data: DividaFormData) => {
    setIsSubmitting(true);
    try {
      const valorAtualizado = calcularValorAtualizado(
        data.valor_original, 
        data.data_vencimento,
        data.multa_personalizada,
        data.juros_personalizado,
        data.correcao_personalizada
      );
      const urgencyScore = calcularUrgencyScore(data.data_vencimento, data.valor_original);

      await adicionarDivida({
        ...data,
        valor_atualizado: valorAtualizado,
        valor_multa: 0, // Será calculado por trigger no banco
        valor_juros: 0,
        valor_correcao: 0,
        urgency_score: urgencyScore
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao cadastrar dívida:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Cadastrar Dívida</h2>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresa_id">Empresa *</Label>
              <Select onValueChange={(value) => setValue('empresa_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.empresa_id && (
                <p className="text-sm text-red-600">{errors.empresa_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="devedor_id">Devedor *</Label>
              <Select 
                onValueChange={(value) => setValue('devedor_id', value)}
                disabled={!selectedEmpresa}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedEmpresa ? "Selecione uma empresa primeiro" : "Selecione o devedor"} />
                </SelectTrigger>
                <SelectContent>
                  {devedoresFiltrados.map((devedor) => (
                    <SelectItem key={devedor.id} value={devedor.id}>
                      {devedor.nome} ({devedor.documento})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.devedor_id && (
                <p className="text-sm text-red-600">{errors.devedor_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem_divida">Origem da Dívida *</Label>
            <Input {...register('origem_divida')} placeholder="Ex: Prestação de Serviços, Venda de Produtos..." />
            {errors.origem_divida && (
              <p className="text-sm text-red-600">{errors.origem_divida.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_contrato">Número do Contrato</Label>
              <Input {...register('numero_contrato')} placeholder="Número do contrato" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_nf">Número da Nota Fiscal</Label>
              <Input {...register('numero_nf')} placeholder="Número da NF" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valores e Datas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Valores e Datas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_original">Valor Original *</Label>
              <Input
                type="number"
                step="0.01"
                {...register('valor_original', { valueAsNumber: true })}
                placeholder="0,00"
              />
              {errors.valor_original && (
                <p className="text-sm text-red-600">{errors.valor_original.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
              <Input
                type="date"
                {...register('data_vencimento')}
              />
              {errors.data_vencimento && (
                <p className="text-sm text-red-600">{errors.data_vencimento.message}</p>
              )}
            </div>
          </div>

          {valorOriginal && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Valor Atualizado (Estimativa)</h4>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(calcularValorAtualizado(
                  valorOriginal, 
                  watch('data_vencimento'),
                  multaPersonalizada,
                  jurosPersonalizado,
                  correcaoPersonalizada
                ))}
              </p>
              <p className="text-sm text-muted-foreground">
                Inclui multas, juros e correção monetária
              </p>
            </div>
          )}

          {/* Índices de Atualização Personalizada */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-800">Índices de Atualização Monetária</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="multa_personalizada">Multa (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="2.00"
                    {...register('multa_personalizada', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">Padrão: 2%</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="juros_personalizado">Juros (% ao mês)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    {...register('juros_personalizado', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">Padrão: 1% ao mês</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correcao_personalizada">Correção (% ao mês)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1.50"
                    {...register('correcao_personalizada', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">Padrão: 1.5% ao mês</p>
                </div>
              </div>

              {/* Opções de Parcelamento */}
              <div className="pt-4 border-t border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="permitir_parcelamento"
                    {...register('permitir_parcelamento')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="permitir_parcelamento">Permitir Parcelamento</Label>
                </div>

                {permitirParcelamento && (
                  <div className="space-y-2">
                    <Label htmlFor="max_parcelas">Máximo de Parcelas</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      placeholder="12"
                      {...register('max_parcelas', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Número máximo de parcelas permitidas para acordo
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Status e Estágio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Status e Estágio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value: any) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status da dívida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="acordado">Acordado</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="judicial">Judicial</SelectItem>
                  <SelectItem value="negativado">Negativado</SelectItem>
                  <SelectItem value="protestado">Protestado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estagio">Estágio</Label>
              <Select onValueChange={(value: any) => setValue('estagio', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estágio da cobrança" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vencimento_proximo">Vencimento Próximo</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="judicial">Judicial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Dívida'}
        </Button>
      </div>
    </form>
  );
}