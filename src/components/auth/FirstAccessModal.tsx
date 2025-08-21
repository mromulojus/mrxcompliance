import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Phone, Building, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FirstAccessModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const FirstAccessModal = ({ isOpen, onComplete }: FirstAccessModalProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: ''
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        department: profile.department || ''
      });
    }
  }, [profile]);

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleComplete = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "Erro",
        description: "Você deve aceitar os termos de uso e a política de privacidade para continuar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload();
      }

      const updateData: any = {
        ...formData,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        first_login_completed: true
      };

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil completado!",
        description: "Bem-vindo à plataforma! Seu perfil foi configurado com sucesso."
      });

      await refreshProfile();
      onComplete();

    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const privacyPolicy = `Política de Privacidade e Proteção de Dados da M R DE S ALVES LTDA

1. Introdução
A M R DE S ALVES LTDA, CNPJ 50.771.881/0001-12, tem o compromisso de proteger a privacidade e os dados pessoais de seus colaboradores, clientes, parceiros e demais usuários de sua plataforma de gestão integrada. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e compartilhamos dados pessoais e demonstra nosso compromisso com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e outras legislações aplicáveis.

Ao utilizar nossa plataforma, que integra módulos como Vendas (xGROWTH), Compliance (Mrx Compliance), Jurídico (MR Advocacia), Ouvidoria (Ouve.ai), Cobrança (Debto) e Administrativo, você concorda com o tratamento de seus dados pessoais conforme esta política.

2. Controlador dos Dados Pessoais
A M R DE S ALVES LTDA atua como Controladora dos Dados Pessoais e é responsável por definir as finalidades e os meios de tratamento dos dados na plataforma.

3. Dados Pessoais Coletados
Coletamos dados pessoais para o funcionamento da plataforma e a prestação dos serviços. Os tipos de dados coletados incluem:

Dados de Identificação e Profissionais: Nome completo, cargo, departamento, foto de perfil, endereço de e-mail corporativo e/ou pessoal, matrícula/ID do colaborador e informações de cadastro formal de usuários.

Dados de Uso da Plataforma:

Dados de Atividade: Histórico de ações (criação, edição, movimentação e exclusão de tarefas/cards), comentários, anexos e interações com outros usuários.

Dados de Tarefas: Título, descrição, responsáveis, co-responsáveis, prazo, nível de prioridade, status e vínculo com empresas ou departamentos.

Dados de Navegação e Acesso: Endereço IP, data e hora de acesso, tipo de navegador, sistema operacional e informações sobre o uso de funcionalidades da plataforma.

Dados de Denúncias (Módulo Ouvidoria): Informações fornecidas voluntariamente pelo denunciante, que podem incluir dados pessoais (nome, CPF, contato) e dados sensíveis (informações de saúde, origem racial ou étnica, opiniões políticas, etc.), dependendo da natureza do relato. A coleta de dados sensíveis ocorre apenas quando estritamente necessária para a investigação da denúncia e conforme as bases legais da LGPD.

Dados de Terceiros: Informações sobre clientes, devedores e parceiros inseridas pelos usuários nos módulos de Vendas, Cobrança e Jurídico, como nome, CNPJ, dados de contato e histórico financeiro.

4. Finalidades e Bases Legais para o Tratamento
O tratamento de seus dados pessoais é realizado para finalidades específicas e com base nas seguintes hipóteses legais da LGPD:

Execução de Contrato ou Procedimentos Preliminares: Para permitir o acesso à plataforma e suas funcionalidades de gestão de tarefas, processos e comunicação.

Cumprimento de Obrigação Legal ou Regulatória: Para atender a exigências de leis, regulamentos e normas de órgãos competentes, como o registro de auditoria, histórico de atividades e informações fiscais.

Exercício Regular de Direitos em Processos: Para gerenciar o canal de denúncias (módulo Ouve.ai), conduzir investigações internas, auditorias de compliance (módulo Mrx Compliance) e defender os interesses da empresa em processos judiciais ou arbitrais (módulo MR Advocacia).

Interesse Legítimo: Para o desenvolvimento, aprimoramento e melhoria contínua da plataforma; para monitorar o desempenho e a produtividade dos módulos e usuários (ranqueamento de tarefas); para gerar análises e relatórios estatísticos e para garantir a segurança da informação.

Consentimento: Para finalidades específicas em que o consentimento do titular é a única base legal aplicável, como o uso de foto de perfil. O consentimento pode ser revogado a qualquer momento.

5. Compartilhamento e Transferência de Dados
Seus dados pessoais podem ser compartilhados nas seguintes circunstâncias:

Entre Usuários da Plataforma: Dados relacionados a tarefas, comentários e projetos são visíveis para outros colaboradores e departamentos envolvidos no processo, conforme as permissões de acesso.

Entre Módulos da Plataforma: Para garantir a funcionalidade e o fluxo de trabalho, os dados podem ser compartilhados entre os módulos. Por exemplo, uma denúncia no módulo Ouve.ai pode gerar uma tarefa no módulo Mrx Compliance e envolver o módulo MR Advocacia.

Com Prestadores de Serviços: Podemos contratar terceiros para fornecer serviços de hospedagem, segurança, infraestrutura ou suporte técnico. Nesses casos, os dados são compartilhados apenas para a execução do serviço e sob contratos que exigem a proteção e a confidencialidade das informações.

Com Autoridades Competentes: Se exigido por lei ou ordem judicial, podemos ser obrigados a compartilhar dados pessoais com autoridades governamentais, regulatórias ou judiciais.

6. Segurança dos Dados Pessoais
Adotamos medidas técnicas e organizacionais rigorosas para proteger seus dados contra acesso não autorizado, destruição, perda, alteração ou qualquer outra forma de tratamento indevido ou ilícito. Nossas medidas incluem:

Controle de acesso restrito a dados pessoais, com base no princípio do mínimo privilégio e no vínculo com departamentos.

Proteção contra acesso não autorizado através de firewalls, sistemas de detecção de intrusão e autenticação de usuários.

Monitoramento constante da segurança para identificar e responder a vulnerabilidades e incidentes.

Treinamento e conscientização de colaboradores sobre as melhores práticas de proteção de dados.

7. Retenção de Dados
Os dados pessoais são retidos pelo tempo necessário para cumprir as finalidades para as quais foram coletados, respeitando os prazos legais e regulatórios exigidos para o armazenamento de documentos e históricos. Após o término da finalidade, os dados serão eliminados ou anonimizados, exceto quando a sua retenção for necessária para o cumprimento de obrigações legais, o exercício de direitos em processos ou para fins de estudo por nosso DPO.

8. Direitos do Titular dos Dados
Em conformidade com a LGPD, você, como titular dos dados, tem os seguintes direitos:

Confirmação e Acesso: Confirmar se tratamos seus dados pessoais e, em caso positivo, solicitar acesso a eles.

Correção: Solicitar a correção de dados incompletos, inexatos ou desatualizados.

Anonimização, Bloqueio ou Eliminação: Solicitar que seus dados sejam anonimizados, bloqueados ou eliminados se forem considerados desnecessários, excessivos ou tratados em desconformidade com a LGPD.

Portabilidade: Requisitar a transferência de seus dados para outro fornecedor de serviço, mediante requisição expressa.

Eliminação: Solicitar a eliminação dos dados tratados com base no seu consentimento.

Informação sobre o Compartilhamento: Obter informações sobre as entidades públicas e privadas com as quais compartilhamos seus dados.

Informação sobre a Possibilidade de Não Fornecer Consentimento: Receber informações sobre as consequências de não fornecer consentimento e sobre a possibilidade de revogá-lo.

Revogação do Consentimento: Retirar seu consentimento a qualquer momento.

Oposição ao Tratamento: Opor-se a tratamentos que não sejam baseados no consentimento.

9. Encarregado de Proteção de Dados (DPO)
Para exercer seus direitos, esclarecer dúvidas sobre esta política ou fazer qualquer solicitação relacionada aos seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO):

Nome do DPO: Dr. Matheus Romulo

Contato: contato@mrxbr.com

10. Atualizações desta Política
Esta política de privacidade pode ser atualizada a qualquer momento para refletir novas práticas de proteção de dados ou alterações na legislação. A versão mais recente estará sempre disponível em nossa plataforma. Recomendamos que você a revise periodicamente.`;

  const termsOfService = `Termos de Uso e Serviço da Plataforma de Gestão Integrada

1. Aceitação dos Termos
Bem-vindo à plataforma de gestão integrada da M R DE S ALVES LTDA, CNPJ 50.771.881/0001-12 ("nós", "nossa", "Empresa"). Ao acessar ou utilizar nossa plataforma, incluindo todos os seus módulos (Vendas, Compliance, Jurídico, Ouvidoria, Cobrança e Administrativo), você concorda com estes Termos de Uso e Serviço ("Termos"). Se você não concorda com todos os termos e condições deste acordo, você não pode utilizar a plataforma.

2. Descrição do Serviço
Nossa plataforma é um sistema de gestão integrada projetado para centralizar e otimizar processos internos, comunicação e operações de diversos departamentos. O serviço permite que os usuários criem e gerenciem tarefas, registrem históricos, armazenem documentos e colaborem em projetos de forma segura e organizada.

3. Acesso e Contas de Usuário
Elegibilidade: Apenas usuários devidamente autorizados e vinculados à nossa corporação têm permissão para criar contas e acessar a plataforma.

Responsabilidade da Conta: Você é o único responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta. Você deve nos notificar imediatamente sobre qualquer uso não autorizado ou falha de segurança.

Informações de Registro: Você se compromete a fornecer informações de registro precisas, completas e atualizadas. A M R DE S ALVES LTDA reserva-se o direito de suspender ou encerrar sua conta se as informações fornecidas forem falsas ou inexatas.

4. Responsabilidades e Conduta do Usuário
Ao utilizar a plataforma, você assume total responsabilidade por suas ações e concorda em:

Usar o serviço de forma ética, legal e profissional, em conformidade com todas as leis, regulamentos e políticas internas da Empresa.

Proteger a confidencialidade de todas as informações acessadas na plataforma, especialmente dados sensíveis, denúncias de ouvidoria, informações de clientes e estratégias de negócios.

Não utilizar a plataforma para fins ilegais ou não autorizados, incluindo a transmissão de material ilegal ou ofensivo.

Não praticar assédio, ameaças, difamação ou qualquer forma de conduta abusiva em relação a outros usuários ou à Empresa.

Não transmitir vírus, malware ou qualquer outro código de natureza destrutiva ou maliciosa.

Não tentar obter acesso não autorizado a contas, sistemas, redes ou dados de outros usuários.

Garantir a veracidade das informações inseridas na plataforma, pois o histórico de suas ações pode ser usado em auditorias de compliance e processos legais.

5. Banimento, Suspensão e Encerramento de Contas
Nós nos reservamos o direito de suspender ou encerrar, a nosso critério, o acesso de qualquer usuário à plataforma, com ou sem aviso prévio, caso identifiquemos uma violação destes Termos.

Violações Graves: A conta do usuário poderá ser imediatamente encerrada em casos de:

Uso da plataforma para atividades ilegais.

Violação de dados ou tentativa de acesso não autorizado.

Conduta gravemente inadequada, incluindo assédio ou ameaças.

Compartilhamento de informações confidenciais de forma indevida.

Violações Menos Graves: Em casos de violações menores, a Empresa poderá optar por suspender temporariamente a conta do usuário e emitir um aviso formal para que a conduta seja corrigida.

Após o encerramento da conta, o acesso do usuário à plataforma será revogado, e a Empresa poderá, a seu critério, excluir ou anonimizar os dados do usuário, exceto aqueles que devem ser retidos por motivos legais ou de compliance.

6. Propriedade Intelectual
Propriedade da Empresa: A plataforma, incluindo seu design, software, código-fonte, funcionalidades e os módulos, são de propriedade exclusiva da M R DE S ALVES LTDA.

Conteúdo do Usuário: Você retém a propriedade sobre todos os dados e informações que você insere na plataforma ("Conteúdo do Usuário"). No entanto, ao usar a plataforma, você nos concede uma licença não exclusiva, mundial e livre de royalties para usar, reproduzir, distribuir e exibir seu Conteúdo do Usuário com a única finalidade de operar e fornecer o serviço a você.

7. Limitação de Responsabilidade
A plataforma é fornecida "no estado em que se encontra", sem garantias de qualquer tipo. A M R DE S ALVES LTDA não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do uso ou da incapacidade de usar a plataforma.

8. Disposições Gerais
Modificações: A M R DE S ALVES LTDA pode revisar e atualizar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação na plataforma.

Lei Aplicável e Foro: Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será submetida ao foro da comarca da sede da empresa.

9. Contato
Para quaisquer dúvidas, entre em contato com nosso Encarregado de Proteção de Dados (DPO), o Dr. Matheus Rômulo, pelo e-mail contato@mrxbr.com`;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Bem-vindo à Plataforma!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6">
          {/* Step 1: Profile Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Configure seu Perfil</h2>
                <p className="text-muted-foreground">
                  Complete seus dados básicos e adicione uma foto de perfil
                </p>
              </div>

              {/* Avatar Section */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl || profile?.avatar_url || ""} />
                    <AvatarFallback className="text-lg">
                      {formData.full_name?.split(' ').map(n => n[0]).join('') || profile?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload-first-access')?.click()}
                    className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                  <input
                    id="avatar-upload-first-access"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo *
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Departamento
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Seu departamento"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.full_name.trim()}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Terms and Privacy */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Termos e Políticas</h2>
                <p className="text-muted-foreground">
                  Leia e aceite nossos termos de uso e política de privacidade
                </p>
              </div>

              <Tabs defaultValue="terms" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="terms">Termos de Uso</TabsTrigger>
                  <TabsTrigger value="privacy">Política de Privacidade</TabsTrigger>
                </TabsList>
                
                <TabsContent value="terms">
                  <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {termsOfService}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="privacy">
                  <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {privacyPolicy}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <label htmlFor="terms" className="text-sm">
                    Li e aceito os Termos de Uso e Serviço
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
                  />
                  <label htmlFor="privacy" className="text-sm">
                    Li e aceito a Política de Privacidade e Proteção de Dados
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={!termsAccepted || !privacyAccepted || loading}
                >
                  {loading ? "Finalizando..." : "Finalizar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};