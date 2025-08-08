import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Colaborador } from '@/types/hr';
import { useHR } from '@/context/HRContext';
import { toast } from 'sonner';

interface FormColaboradorProps {
  colaborador?: Colaborador;
  onSalvar?: () => void;
  onCancelar?: () => void;
}

export function FormColaborador({ colaborador, onSalvar, onCancelar }: FormColaboradorProps) {
  const { adicionarColaborador, editarColaborador, empresas } = useHR();
  
  const [formData, setFormData] = useState({
    nome: colaborador?.nome || '',
    email: colaborador?.email || '',
    cargo: colaborador?.cargo || '',
    departamento: colaborador?.departamento || '',
    empresa: colaborador?.empresa || '',
    status: colaborador?.status || 'ATIVO' as const,
    data_admissao: colaborador?.data_admissao || '',
    data_nascimento: colaborador?.data_nascimento || '',
    sexo: colaborador?.sexo || 'MASCULINO' as const,
    salario_base: colaborador?.salario_base || 0,
    telefone: colaborador?.telefone || '',
    endereco: colaborador?.endereco || '',
    cpf: colaborador?.documentos?.cpf || '',
    rg: colaborador?.documentos?.rg || '',
    ctps: colaborador?.documentos?.ctps || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.empresa) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const dados: Omit<Colaborador, 'id' | 'auditoria'> = {
      nome: formData.nome,
      email: formData.email,
      cargo: formData.cargo,
      departamento: formData.departamento,
      empresa: formData.empresa,
      status: formData.status,
      tipo_contrato: 'CLT' as const,
      data_admissao: formData.data_admissao,
      data_nascimento: formData.data_nascimento,
      sexo: formData.sexo,
      salario_base: formData.salario_base,
      telefone: formData.telefone,
      celular: formData.telefone, // usando mesmo valor por enquanto
      endereco: formData.endereco,
      cep: '',
      cidade: '',
      estado: '',
      estado_civil: 'SOLTEIRO',
      escolaridade: 'MEDIO',
      nome_mae: '',
      nome_pai: '',
      contato_emergencia: {
        nome: '',
        telefone: '',
        parentesco: ''
      },
      documentos: {
        cpf: formData.cpf,
        rg: formData.rg,
        rg_orgao_emissor: '',
        ctps: formData.ctps,
        ctps_serie: '',
        pis_pasep: '',
        titulo_eleitor: '',
        reservista: ''
      },
      beneficios: {
        vale_transporte: false,
        vale_refeicao: false,
        valor_vale_transporte: 0,
        valor_vale_refeicao: 0,
        plano_saude: false,
        plano_odontologico: false
      },
      dependentes: {
        tem_filhos_menores_14: false,
        quantidade_filhos: 0,
        filhos: []
      },
      dados_bancarios: {
        banco: '',
        agencia: '',
        conta: '',
        tipo_conta: 'CORRENTE',
        pix: ''
      },
      documentos_arquivos: [],
      historico: []
    };

    if (colaborador) {
      editarColaborador(colaborador.id, dados);
      toast.success('Colaborador atualizado com sucesso!');
    } else {
      adicionarColaborador(dados);
      toast.success('Colaborador adicionado com sucesso!');
    }

    onSalvar?.();
  };

  const handleChange = (campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                  placeholder="Cargo do colaborador"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleChange('departamento', e.target.value)}
                  placeholder="Departamento"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select value={formData.empresa} onValueChange={(value) => handleChange('empresa', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar empresa" />
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
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                    <SelectItem value="DEMITIDO">Demitido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={formData.sexo} onValueChange={(value) => handleChange('sexo', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Informações Financeiras e Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Adicionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salario">Salário Base</Label>
                <Input
                  id="salario"
                  type="number"
                  value={formData.salario_base}
                  onChange={(e) => handleChange('salario_base', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admissao">Data de Admissão</Label>
                <Input
                  id="admissao"
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => handleChange('data_admissao', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nascimento">Data de Nascimento</Label>
                <Input
                  id="nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleChange('data_nascimento', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                placeholder="Endereço completo"
                rows={2}
              />
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleChange('rg', e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ctps">CTPS</Label>
                <Input
                  id="ctps"
                  value={formData.ctps}
                  onChange={(e) => handleChange('ctps', e.target.value)}
                  placeholder="0000000000"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button type="submit">
              {colaborador ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}