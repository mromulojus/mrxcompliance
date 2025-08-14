import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Phone, Mail, MapPin, Settings } from "lucide-react";
import { useDebtoData } from "@/hooks/useDebtoData";
import { toast } from "sonner";

const debtorSchema = z.object({
  empresa_id: z.string().min(1, "Empresa é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  documento: z.string().min(11, "Documento inválido"),
  tipo_pessoa: z.enum(['FISICA', 'JURIDICA']),
  endereco_completo: z.string().optional(),
  cep: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone_principal: z.string().optional(),
  telefone_whatsapp: z.string().optional(),
  email_principal: z.string().email("Email inválido").optional().or(z.literal("")),
  email_secundario: z.string().email("Email inválido").optional().or(z.literal("")),
  contato_emergencia_nome: z.string().optional(),
  contato_emergencia_telefone: z.string().optional(),
  local_trabalho: z.string().optional(),
  canal_preferencial: z.enum(['whatsapp', 'telefone', 'email', 'sms']),
  observacoes: z.string().optional()
});

type DebtorFormData = z.infer<typeof debtorSchema>;

interface FormDebtorProps {
  onSuccess?: () => void;
}

export function FormDebtor({ onSuccess }: FormDebtorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { empresas, adicionarDevedor } = useDebtoData();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DebtorFormData>({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      tipo_pessoa: 'FISICA',
      canal_preferencial: 'whatsapp'
    }
  });

  const tipoPessoa = watch('tipo_pessoa');

  const formatDocument = (value: string, tipo: 'FISICA' | 'JURIDICA') => {
    const numbers = value.replace(/\D/g, '');
    
    if (tipo === 'FISICA') {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const onSubmit = async (data: DebtorFormData) => {
    setIsSubmitting(true);
    try {
      await adicionarDevedor({
        ...data,
        score_recuperabilidade: 50 // Score inicial padrão
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao cadastrar devedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Cadastrar Devedor</h2>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
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
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa *</Label>
              <Select onValueChange={(value: 'FISICA' | 'JURIDICA') => setValue('tipo_pessoa', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de pessoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FISICA">Pessoa Física</SelectItem>
                  <SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                {...register('nome')}
                placeholder={tipoPessoa === 'FISICA' ? "Nome completo" : "Razão social"}
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">
                {tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ'} *
              </Label>
              <Input
                {...register('documento')}
                placeholder={tipoPessoa === 'FISICA' ? "000.000.000-00" : "00.000.000/0000-00"}
                onChange={(e) => {
                  const formatted = formatDocument(e.target.value, tipoPessoa);
                  setValue('documento', formatted);
                }}
              />
              {errors.documento && (
                <p className="text-sm text-red-600">{errors.documento.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                {...register('cep')}
                placeholder="00000-000"
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '');
                  const formatted = numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
                  setValue('cep', formatted);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input {...register('cidade')} placeholder="Cidade" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input {...register('estado')} placeholder="UF" maxLength={2} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_completo">Endereço Completo</Label>
            <Input {...register('endereco_completo')} placeholder="Rua, número, bairro..." />
          </div>
        </CardContent>
      </Card>

      {/* Contatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contatos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone_principal">Telefone Principal</Label>
              <Input
                {...register('telefone_principal')}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue('telefone_principal', formatted);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone_whatsapp">WhatsApp</Label>
              <Input
                {...register('telefone_whatsapp')}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue('telefone_whatsapp', formatted);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email_principal">Email Principal</Label>
              <Input {...register('email_principal')} type="email" placeholder="email@exemplo.com" />
              {errors.email_principal && (
                <p className="text-sm text-red-600">{errors.email_principal.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_secundario">Email Secundário</Label>
              <Input {...register('email_secundario')} type="email" placeholder="email2@exemplo.com" />
              {errors.email_secundario && (
                <p className="text-sm text-red-600">{errors.email_secundario.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contato_emergencia_nome">Contato de Emergência</Label>
              <Input {...register('contato_emergencia_nome')} placeholder="Nome do contato" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato_emergencia_telefone">Telefone de Emergência</Label>
              <Input
                {...register('contato_emergencia_telefone')}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue('contato_emergencia_telefone', formatted);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local_trabalho">Local de Trabalho</Label>
              <Input {...register('local_trabalho')} placeholder="Empresa onde trabalha" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="canal_preferencial">Canal Preferencial</Label>
              <Select onValueChange={(value: any) => setValue('canal_preferencial', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Canal preferencial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea {...register('observacoes')} placeholder="Observações gerais sobre o devedor..." />
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Devedor'}
        </Button>
      </div>
    </form>
  );
}