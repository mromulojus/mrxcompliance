import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DocumentsManager } from './DocumentsManager';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Users,
  Banknote,
  History,
  Download,
  Eye,
  Edit,
  TrendingUp,
  Home,
  DollarSign
} from 'lucide-react';
import { Colaborador } from '@/types/hr';
import { ExportPdf } from './ExportPdf';
import { calcularRescisaoColaborador, calcularValorPrevisto } from '@/lib/rescisao';

interface VisualizacaoColaboradorCompletaProps {
  colaborador: Colaborador;
  onClose: () => void;
  onEdit?: (id: string) => void;
}

export function VisualizacaoColaboradorCompleta({ colaborador, onClose, onEdit }: VisualizacaoColaboradorCompletaProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800';
      case 'INATIVO':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEMITIDO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const rescisao = calcularRescisaoColaborador(colaborador);
  const valorRescisao = 'totalEstimado' in rescisao ? parseFloat(rescisao.totalEstimado) : 0;
  const valorPrevisto = calcularValorPrevisto(valorRescisao);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ScrollArea className="h-[90vh]">
        <div className="space-y-6">
          {/* Header com foto e informações principais */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={colaborador.foto_perfil} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {colaborador.nome?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {colaborador.nome}
                    </h1>
                    <Badge className={getStatusColor(colaborador.status)}>
                      {colaborador.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{colaborador.cargo} - {colaborador.departamento}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{colaborador.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{colaborador.telefone || colaborador.celular}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Admitido em {formatarData(colaborador.data_admissao)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ExportPdf type="colaborador" data={colaborador} />
                  {onEdit && (
                    <Button onClick={() => onEdit(colaborador.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  <Button variant="outline" onClick={onClose}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid com todas as informações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="font-semibold">{colaborador.documentos?.cpf}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RG</label>
                    <p className="font-semibold">
                      {colaborador.documentos?.rg}
                      {colaborador.documentos?.rg_orgao_emissor && ` - ${colaborador.documentos.rg_orgao_emissor}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p className="font-semibold">{formatarData(colaborador.data_nascimento)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                    <p className="font-semibold">{colaborador.sexo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
                    <p className="font-semibold">{colaborador.estado_civil}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Escolaridade</label>
                    <p className="font-semibold">{colaborador.escolaridade}</p>
                  </div>
                </div>
                
                {colaborador.nome_mae && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome da Mãe</label>
                        <p className="font-semibold">{colaborador.nome_mae}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome do Pai</label>
                        <p className="font-semibold">{colaborador.nome_pai || 'Não informado'}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Endereço e Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço Completo</label>
                  <p className="font-semibold">
                    {colaborador.endereco}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {colaborador.cidade}/{colaborador.estado}
                  </p>
                  <p className="text-sm text-muted-foreground">CEP: {colaborador.cep}</p>
                </div>

                {colaborador.contato_emergencia && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contato de Emergência</label>
                      <p className="font-semibold">{colaborador.contato_emergencia.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {colaborador.contato_emergencia.telefone} ({colaborador.contato_emergencia.parentesco})
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                    <p className="font-semibold">{colaborador.cargo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                    <p className="font-semibold">{colaborador.departamento}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Contrato</label>
                    <p className="font-semibold">{colaborador.tipo_contrato}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Admissão</label>
                    <p className="font-semibold">{formatarData(colaborador.data_admissao)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salário Base</label>
                    <p className="font-semibold">{formatarMoeda(colaborador.salario_base)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(colaborador.status)}>
                      {colaborador.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {colaborador.documentos && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CTPS</label>
                      <p className="font-semibold">
                        {colaborador.documentos.ctps}
                        {colaborador.documentos.ctps_serie && ` - Série ${colaborador.documentos.ctps_serie}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">PIS/PASEP</label>
                      <p className="font-semibold">{colaborador.documentos.pis_pasep}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Título de Eleitor</label>
                      <p className="font-semibold">{colaborador.documentos.titulo_eleitor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reservista</label>
                      <p className="font-semibold">{colaborador.documentos.reservista}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefícios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span>Vale Refeição</span>
                       <Badge variant={colaborador.beneficios?.vale_refeicao ? 'default' : 'secondary'}>
                         {colaborador.beneficios?.vale_refeicao ? 'Ativo' : 'Inativo'}
                       </Badge>
                     </div>
                     {colaborador.beneficios?.valor_vale_refeicao && colaborador.beneficios.valor_vale_refeicao > 0 && (
                       <p className="text-sm text-muted-foreground">
                         Valor: {formatarMoeda(colaborador.beneficios.valor_vale_refeicao)}
                       </p>
                     )}
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span>Vale Transporte</span>
                       <Badge variant={colaborador.beneficios?.vale_transporte ? 'default' : 'secondary'}>
                         {colaborador.beneficios?.vale_transporte ? 'Ativo' : 'Inativo'}
                       </Badge>
                     </div>
                     {colaborador.beneficios?.valor_vale_transporte && colaborador.beneficios.valor_vale_transporte > 0 && (
                       <p className="text-sm text-muted-foreground">
                         Valor: {formatarMoeda(colaborador.beneficios.valor_vale_transporte)}
                       </p>
                     )}
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span>Plano de Saúde</span>
                       <Badge variant={colaborador.beneficios?.plano_saude ? 'default' : 'secondary'}>
                         {colaborador.beneficios?.plano_saude ? 'Ativo' : 'Inativo'}
                       </Badge>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span>Plano Odontológico</span>
                       <Badge variant={colaborador.beneficios?.plano_odontologico ? 'default' : 'secondary'}>
                         {colaborador.beneficios?.plano_odontologico ? 'Ativo' : 'Inativo'}
                       </Badge>
                     </div>
                   </div>
                 </div>

                 {/* Adicionais Salariais */}
                 <Separator />
                 <div>
                   <h4 className="font-semibold mb-3">Adicionais Salariais</h4>
                   <div className="grid grid-cols-3 gap-4">
                     <div>
                       <label className="text-sm font-medium text-muted-foreground">Periculosidade</label>
                       <p className="font-semibold">{formatarMoeda((colaborador as any)?.periculosidade || 0)}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-muted-foreground">Insalubridade</label>
                       <p className="font-semibold">{formatarMoeda((colaborador as any)?.insalubridade || 0)}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-muted-foreground">Outros Valores</label>
                       <p className="font-semibold">{formatarMoeda((colaborador as any)?.outros_valores || 0)}</p>
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Dependentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Dependentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Filhos menores de 14 anos</label>
                      <p className="font-semibold">
                        {colaborador.dependentes?.tem_filhos_menores_14 ? 'Sim' : 'Não'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Quantidade de filhos</label>
                      <p className="font-semibold">{colaborador.dependentes?.quantidade_filhos || 0}</p>
                    </div>
                  </div>

                  {colaborador.dependentes?.filhos && colaborador.dependentes.filhos.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Dados dos Filhos</label>
                      {colaborador.dependentes.filhos.map((filho, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Nome</label>
                              <p className="text-sm font-medium">{filho.nome}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Nascimento</label>
                              <p className="text-sm">{formatarData(filho.data_nascimento)}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">CPF</label>
                              <p className="text-sm">{filho.cpf || 'Não informado'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados Bancários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Dados Bancários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Banco</label>
                    <p className="font-semibold">{colaborador.dados_bancarios?.banco}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agência</label>
                    <p className="font-semibold">{colaborador.dados_bancarios?.agencia}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Conta</label>
                    <p className="font-semibold">{colaborador.dados_bancarios?.conta}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Conta</label>
                    <p className="font-semibold">{colaborador.dados_bancarios?.tipo_conta}</p>
                  </div>
                </div>
                {colaborador.dados_bancarios?.pix && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">PIX</label>
                      <p className="font-semibold">{colaborador.dados_bancarios.pix}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Documentos do Colaborador */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos do Colaborador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentsManager 
                  colaboradorId={colaborador.id}
                  onDocumentChange={() => {}}
                />
              </CardContent>
            </Card>

            {/* Cálculo de Rescisão */}
            {'totalEstimado' in rescisao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cálculo de Rescisão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                      <p className="font-semibold">{rescisao.tipo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meses Trabalhados</label>
                      <p className="font-semibold">{rescisao.mesesTrabalhados}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Total Estimado:</span>
                      <span className="font-bold text-red-600">
                        {formatarMoeda(parseFloat(rescisao.totalEstimado))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Valor Previsto:</span>
                      <span className="font-bold text-orange-600">
                        {formatarMoeda(valorPrevisto)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  {colaborador.historico?.length ? (
                    <div className="space-y-2">
                      {colaborador.historico.map((obs, index) => (
                        <div key={index} className="p-3 border rounded-lg bg-muted/50">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-xs">
                              {formatarData(obs.data)} - {obs.usuario}
                            </Badge>
                          </div>
                          <p className="text-sm">{obs.observacao}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma observação registrada
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}