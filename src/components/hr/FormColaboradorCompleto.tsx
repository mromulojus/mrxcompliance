import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Colaborador } from '@/types/hr';
import { useHR } from '@/context/HRContext';
import { toast } from 'sonner';
import { Camera, Upload, FileText, Eye, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { DocumentsManager } from './DocumentsManager';

interface FormColaboradorCompletoProps {
  colaborador?: Colaborador;
  empresaId?: string;
  onSalvar?: () => void;
  onCancelar?: () => void;
}

export function FormColaboradorCompleto({ colaborador, empresaId, onSalvar, onCancelar }: FormColaboradorCompletoProps) {
  const { adicionarColaborador, editarColaborador } = useHR();
  const { empresas } = useSupabaseData();
  
  const [formData, setFormData] = useState({
    // Dados básicos
    nome: colaborador?.nome || '',
    email: colaborador?.email || '',
    cargo: colaborador?.cargo || '',
    departamento: colaborador?.departamento || '',
    empresa: colaborador?.empresa || empresaId || '',
    status: colaborador?.status || 'ATIVO' as 'ATIVO' | 'INATIVO' | 'DEMITIDO' | 'PROCESSO_SELETIVO',
    tipo_contrato: colaborador?.tipo_contrato || 'CLT' as const,
    data_admissao: colaborador?.data_admissao || '',
    data_nascimento: colaborador?.data_nascimento || '',
    sexo: colaborador?.sexo || 'MASCULINO' as const,
    salario_base: colaborador?.salario_base || 0,
    
    // Contatos
    telefone: colaborador?.telefone || '',
    celular: colaborador?.celular || '',
    
    // Endereço
    endereco: colaborador?.endereco || '',
    cep: colaborador?.cep || '',
    cidade: colaborador?.cidade || '',
    estado: colaborador?.estado || '',
    
    // Dados pessoais
    estado_civil: colaborador?.estado_civil || 'SOLTEIRO' as const,
    escolaridade: colaborador?.escolaridade || 'MEDIO' as const,
    nome_mae: colaborador?.nome_mae || '',
    nome_pai: colaborador?.nome_pai || '',
    
    // Contato de emergência
    emergencia_nome: colaborador?.contato_emergencia?.nome || '',
    emergencia_telefone: colaborador?.contato_emergencia?.telefone || '',
    emergencia_parentesco: colaborador?.contato_emergencia?.parentesco || '',
    
    // Documentos
    cpf: colaborador?.documentos?.cpf || '',
    rg: colaborador?.documentos?.rg || '',
    rg_orgao_emissor: colaborador?.documentos?.rg_orgao_emissor || '',
    ctps: colaborador?.documentos?.ctps || '',
    ctps_serie: colaborador?.documentos?.ctps_serie || '',
    pis_pasep: colaborador?.documentos?.pis_pasep || '',
    titulo_eleitor: colaborador?.documentos?.titulo_eleitor || '',
    reservista: colaborador?.documentos?.reservista || '',
    
    // Benefícios
    vale_transporte: colaborador?.beneficios?.vale_transporte || false,
    vale_refeicao: colaborador?.beneficios?.vale_refeicao || false,
    valor_vale_transporte: colaborador?.beneficios?.valor_vale_transporte || 0,
    valor_vale_refeicao: colaborador?.beneficios?.valor_vale_refeicao || 0,
    plano_saude: colaborador?.beneficios?.plano_saude || false,
    plano_odontologico: colaborador?.beneficios?.plano_odontologico || false,
    
    // Dependentes
    tem_filhos_menores_14: colaborador?.dependentes?.tem_filhos_menores_14 || false,
    quantidade_filhos: colaborador?.dependentes?.quantidade_filhos || 0,
    filhos: colaborador?.dependentes?.filhos || [],
    
    // Adicionais salariais
    periculosidade: (colaborador as any)?.periculosidade || 0,
    insalubridade: (colaborador as any)?.insalubridade || 0,
    outros_valores: (colaborador as any)?.outros_valores || 0,
    
    // Dados bancários
    banco: colaborador?.dados_bancarios?.banco || '',
    agencia: colaborador?.dados_bancarios?.agencia || '',
    conta: colaborador?.dados_bancarios?.conta || '',
    tipo_conta: colaborador?.dados_bancarios?.tipo_conta || 'CORRENTE' as const,
    pix: colaborador?.dados_bancarios?.pix || '',
  });

  const [historico, setHistorico] = useState(colaborador?.historico || []);
  const [novaObservacao, setNovaObservacao] = useState('');

  const adicionarObservacao = () => {
    if (!novaObservacao.trim()) return;
    
    const novaObs = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      observacao: novaObservacao,
      usuario: 'Usuário Atual'
    };
    
    setHistorico(prev => [novaObs, ...prev]);
    setNovaObservacao('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('FormData completo:', formData);
    
    if (!formData.nome || !formData.email || !formData.empresa || !formData.cpf) {
      console.log('Campos obrigatórios faltando:', { nome: formData.nome, email: formData.email, empresa: formData.empresa, cpf: formData.cpf });
      toast.error('Preencha os campos obrigatórios: Nome, Email, Empresa e CPF');
      return;
    }

    console.log('Preparando dados para envio...');
    const dados: Omit<Colaborador, 'id' | 'auditoria'> = {
      nome: formData.nome,
      email: formData.email,
      cargo: formData.cargo,
      departamento: formData.departamento,
      empresa: formData.empresa,
      status: formData.status,
      tipo_contrato: formData.tipo_contrato,
      data_admissao: formData.data_admissao,
      data_nascimento: formData.data_nascimento,
      sexo: formData.sexo,
      salario_base: formData.salario_base,
      telefone: formData.telefone,
      celular: formData.celular,
      endereco: formData.endereco,
      cep: formData.cep,
      cidade: formData.cidade,
      estado: formData.estado,
      estado_civil: formData.estado_civil,
      escolaridade: formData.escolaridade,
      nome_mae: formData.nome_mae,
      nome_pai: formData.nome_pai,
      contato_emergencia: {
        nome: formData.emergencia_nome,
        telefone: formData.emergencia_telefone,
        parentesco: formData.emergencia_parentesco
      },
      documentos: {
        cpf: formData.cpf,
        rg: formData.rg,
        rg_orgao_emissor: formData.rg_orgao_emissor,
        ctps: formData.ctps,
        ctps_serie: formData.ctps_serie,
        pis_pasep: formData.pis_pasep,
        titulo_eleitor: formData.titulo_eleitor,
        reservista: formData.reservista
      },
      beneficios: {
        vale_transporte: formData.vale_transporte,
        vale_refeicao: formData.vale_refeicao,
        valor_vale_transporte: formData.valor_vale_transporte,
        valor_vale_refeicao: formData.valor_vale_refeicao,
        plano_saude: formData.plano_saude,
        plano_odontologico: formData.plano_odontologico
      },
      dependentes: {
        tem_filhos_menores_14: formData.tem_filhos_menores_14,
        quantidade_filhos: formData.quantidade_filhos,
        filhos: formData.filhos
      },
      dados_bancarios: {
        banco: formData.banco,
        agencia: formData.agencia,
        conta: formData.conta,
        tipo_conta: formData.tipo_conta,
        pix: formData.pix
      },
      foto_perfil: colaborador?.foto_perfil,
      documentos_arquivos: colaborador?.documentos_arquivos || [],
      historico: historico
    };

    if (colaborador) {
      console.log('Editando colaborador existente:', colaborador.id);
      editarColaborador(colaborador.id, dados);
      toast.success('Colaborador atualizado com sucesso!');
    } else {
      console.log('Adicionando novo colaborador:', dados);
      adicionarColaborador(dados);
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => toast.info('Upload de foto será implementado em breve')}
          >
            <Camera className="h-4 w-4 mr-1" />
            Foto de Perfil
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basicos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basicos">Básicos</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="beneficios">Benefícios e Dependentes</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="basicos" className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => handleChange('celular', e.target.value)}
                    placeholder="(11) 99999-9999"
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
                  <Select value={formData.departamento} onValueChange={(value) => handleChange('departamento', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECURSOS_HUMANOS">Recursos Humanos</SelectItem>
                      <SelectItem value="TECNOLOGIA">Tecnologia</SelectItem>
                      <SelectItem value="VENDAS">Vendas</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                      <SelectItem value="OPERACIONAL">Operacional</SelectItem>
                      <SelectItem value="JURIDICO">Jurídico</SelectItem>
                      <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                      <SelectItem value="COMERCIAL">Comercial</SelectItem>
                      <SelectItem value="CRIAR_NOVO">+ Criar Departamento</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="PROCESSO_SELETIVO">Processo Seletivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                  <Select value={formData.tipo_contrato} onValueChange={(value) => handleChange('tipo_contrato', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="PF">PF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select value={formData.estado_civil} onValueChange={(value) => handleChange('estado_civil', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                      <SelectItem value="CASADO">Casado(a)</SelectItem>
                      <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                      <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                      <SelectItem value="UNIAO_ESTAVEL">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="escolaridade">Escolaridade</Label>
                  <Select value={formData.escolaridade} onValueChange={(value) => handleChange('escolaridade', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FUNDAMENTAL">Ensino Fundamental</SelectItem>
                      <SelectItem value="MEDIO">Ensino Médio</SelectItem>
                      <SelectItem value="SUPERIOR">Ensino Superior</SelectItem>
                      <SelectItem value="POS_GRADUACAO">Pós-graduação</SelectItem>
                      <SelectItem value="MESTRADO">Mestrado</SelectItem>
                      <SelectItem value="DOUTORADO">Doutorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_mae">Nome da Mãe</Label>
                  <Input
                    id="nome_mae"
                    value={formData.nome_mae}
                    onChange={(e) => handleChange('nome_mae', e.target.value)}
                    placeholder="Nome completo da mãe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_pai">Nome do Pai</Label>
                  <Input
                    id="nome_pai"
                    value={formData.nome_pai}
                    onChange={(e) => handleChange('nome_pai', e.target.value)}
                    placeholder="Nome completo do pai"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Contato de Emergência</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencia_nome">Nome</Label>
                    <Input
                      id="emergencia_nome"
                      value={formData.emergencia_nome}
                      onChange={(e) => handleChange('emergencia_nome', e.target.value)}
                      placeholder="Nome do contato"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencia_telefone">Telefone</Label>
                    <Input
                      id="emergencia_telefone"
                      value={formData.emergencia_telefone}
                      onChange={(e) => handleChange('emergencia_telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencia_parentesco">Parentesco</Label>
                    <Input
                      id="emergencia_parentesco"
                      value={formData.emergencia_parentesco}
                      onChange={(e) => handleChange('emergencia_parentesco', e.target.value)}
                      placeholder="Ex: Mãe, Pai, Cônjuge"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    placeholder="SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    placeholder="Rua, número, complemento"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documentos</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast.info('Conecte ao Supabase para upload de documentos')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Documentos
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleChange('rg', e.target.value)}
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rg_orgao_emissor">Órgão Emissor RG</Label>
                  <Input
                    id="rg_orgao_emissor"
                    value={formData.rg_orgao_emissor}
                    onChange={(e) => handleChange('rg_orgao_emissor', e.target.value)}
                    placeholder="SSP/SP"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctps_serie">Série CTPS</Label>
                  <Input
                    id="ctps_serie"
                    value={formData.ctps_serie}
                    onChange={(e) => handleChange('ctps_serie', e.target.value)}
                    placeholder="001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pis_pasep">PIS/PASEP</Label>
                  <Input
                    id="pis_pasep"
                    value={formData.pis_pasep}
                    onChange={(e) => handleChange('pis_pasep', e.target.value)}
                    placeholder="12345678901"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                  <Input
                    id="titulo_eleitor"
                    value={formData.titulo_eleitor}
                    onChange={(e) => handleChange('titulo_eleitor', e.target.value)}
                    placeholder="123456789012"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reservista">Certificado de Reservista</Label>
                <Input
                  id="reservista"
                  value={formData.reservista}
                  onChange={(e) => handleChange('reservista', e.target.value)}
                  placeholder="123456789"
                />
              </div>

              {/* Dados Bancários */}
              <div className="space-y-4 mt-6">
                <h4 className="font-medium">Dados Bancários</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banco">Banco</Label>
                    <Input
                      id="banco"
                      value={formData.banco}
                      onChange={(e) => handleChange('banco', e.target.value)}
                      placeholder="001 - Banco do Brasil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agencia">Agência</Label>
                    <Input
                      id="agencia"
                      value={formData.agencia}
                      onChange={(e) => handleChange('agencia', e.target.value)}
                      placeholder="1234-5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta</Label>
                    <Input
                      id="conta"
                      value={formData.conta}
                      onChange={(e) => handleChange('conta', e.target.value)}
                      placeholder="12345-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                    <Select value={formData.tipo_conta} onValueChange={(value) => handleChange('tipo_conta', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                        <SelectItem value="POUPANCA">Conta Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pix">PIX</Label>
                    <Input
                      id="pix"
                      value={formData.pix}
                      onChange={(e) => handleChange('pix', e.target.value)}
                      placeholder="CPF, email ou telefone"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de documentos uploadados */}
              {/* Upload de documentos */}
              {colaborador && (
                <div className="space-y-4 mt-6">
                  <DocumentsManager 
                    colaboradorId={colaborador.id}
                    onDocumentChange={() => {
                      toast.success('Documento atualizado!');
                    }}
                  />
                </div>
              )}

              <div className="space-y-4 mt-6">
                <h4 className="font-medium">Documentos Digitais</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['RG', 'CPF', 'CTPS', 'Comprovante', 'Diploma', 'Certidão', 'Laudo', 'Contrato'].map((doc) => (
                    <Button
                      key={doc}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => colaborador ? toast.info('Use o formulário de upload acima') : toast.info('Salve o colaborador primeiro para fazer upload')}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      {doc}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="beneficios" className="space-y-6">
              <div className="space-y-6">
                {/* Benefícios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Benefícios</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vale_transporte"
                          checked={formData.vale_transporte}
                          onCheckedChange={(checked) => handleChange('vale_transporte', checked)}
                        />
                        <Label htmlFor="vale_transporte">Vale Transporte</Label>
                      </div>

                      {formData.vale_transporte && (
                        <div className="space-y-2 ml-6">
                          <Label htmlFor="valor_vale_transporte">Valor do Vale Transporte</Label>
                          <Input
                            id="valor_vale_transporte"
                            type="number"
                            value={formData.valor_vale_transporte}
                            onChange={(e) => handleChange('valor_vale_transporte', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vale_refeicao"
                          checked={formData.vale_refeicao}
                          onCheckedChange={(checked) => handleChange('vale_refeicao', checked)}
                        />
                        <Label htmlFor="vale_refeicao">Vale Refeição</Label>
                      </div>

                      {formData.vale_refeicao && (
                        <div className="space-y-2 ml-6">
                          <Label htmlFor="valor_vale_refeicao">Valor do Vale Refeição</Label>
                          <Input
                            id="valor_vale_refeicao"
                            type="number"
                            value={formData.valor_vale_refeicao}
                            onChange={(e) => handleChange('valor_vale_refeicao', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano_saude"
                          checked={formData.plano_saude}
                          onCheckedChange={(checked) => handleChange('plano_saude', checked)}
                        />
                        <Label htmlFor="plano_saude">Plano de Saúde</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano_odontologico"
                          checked={formData.plano_odontologico}
                          onCheckedChange={(checked) => handleChange('plano_odontologico', checked)}
                        />
                        <Label htmlFor="plano_odontologico">Plano Odontológico</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adicionais Salariais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adicionais Salariais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="periculosidade">Periculosidade (R$)</Label>
                      <Input
                        id="periculosidade"
                        type="number"
                        value={formData.periculosidade}
                        onChange={(e) => handleChange('periculosidade', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insalubridade">Insalubridade (R$)</Label>
                      <Input
                        id="insalubridade"
                        type="number"
                        value={formData.insalubridade}
                        onChange={(e) => handleChange('insalubridade', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outros_valores">Outros Valores (R$)</Label>
                      <Input
                        id="outros_valores"
                        type="number"
                        value={formData.outros_valores}
                        onChange={(e) => handleChange('outros_valores', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Dependentes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dependentes</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tem_filhos_menores_14"
                        checked={formData.tem_filhos_menores_14}
                        onCheckedChange={(checked) => handleChange('tem_filhos_menores_14', checked)}
                      />
                      <Label htmlFor="tem_filhos_menores_14">Tem filhos menores de 14 anos</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantidade_filhos">Quantidade de Filhos</Label>
                      <Input
                        id="quantidade_filhos"
                        type="number"
                        value={formData.quantidade_filhos}
                        onChange={(e) => handleChange('quantidade_filhos', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        className="w-32"
                      />
                    </div>

                    {formData.filhos.length > 0 && (
                      <div className="space-y-2">
                        <Label>Dados dos Filhos</Label>
                        {formData.filhos.map((filho, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <Label>Nome</Label>
                                <span className="block text-sm">{filho.nome}</span>
                              </div>
                              <div>
                                <Label>Data de Nascimento</Label>
                                <span className="block text-sm">{new Date(filho.data_nascimento).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <Label>CPF</Label>
                                <span className="block text-sm">{filho.cpf || 'Não informado'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>


            <TabsContent value="historico" className="space-y-4">
              <h3 className="text-lg font-semibold">Histórico de Observações</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nova_observacao">Nova Observação</Label>
                  <Textarea
                    id="nova_observacao"
                    value={novaObservacao}
                    onChange={(e) => setNovaObservacao(e.target.value)}
                    placeholder="Digite uma observação sobre o colaborador..."
                    rows={3}
                  />
                  <Button type="button" onClick={adicionarObservacao} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Observação
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Histórico</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {historico.map((obs) => (
                      <div key={obs.id} className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-xs">
                            {new Date(obs.data).toLocaleDateString()} - {obs.usuario}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistorico(prev => prev.filter(h => h.id !== obs.id))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm">{obs.observacao}</p>
                      </div>
                    ))}
                    {historico.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhuma observação registrada.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancelar}>
                Cancelar
              </Button>
              <Button type="submit">
                {colaborador ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}