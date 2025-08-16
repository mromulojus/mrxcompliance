import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Colaborador, Empresa } from "@/types/hr";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportPdfProps {
  type: 'colaborador' | 'empresa';
  data: Colaborador | Empresa;
  colaboradores?: Colaborador[];
}

export function ExportPdf({ type, data, colaboradores = [] }: ExportPdfProps) {
  const { toast } = useToast();

  const generateColaboradorPdf = async (colaborador: Colaborador) => {
    try {
      // Criar um elemento temporário com o layout do colaborador
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';

      const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      };

      const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
      };

      tempDiv.innerHTML = `
        <div style="margin-bottom: 30px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">
                ${colaborador.nome?.charAt(0) || 'C'}
              </div>
              <div style="flex: 1;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${colaborador.nome}</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${colaborador.cargo} - ${colaborador.departamento}</p>
                <div style="display: flex; gap: 20px; margin-top: 12px; font-size: 14px;">
                  <span>📧 ${colaborador.email}</span>
                  <span>📱 ${colaborador.telefone || colaborador.celular}</span>
                  <span>📅 Admitido em ${formatarData(colaborador.data_admissao)}</span>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="background: ${colaborador.status === 'ATIVO' ? '#10b981' : colaborador.status === 'INATIVO' ? '#f59e0b' : '#ef4444'}; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                  ${colaborador.status}
                </div>
              </div>
            </div>
          </div>

          <!-- Grid de Informações -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            
            <!-- Dados Pessoais -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">👤 Dados Pessoais</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                <div><strong>CPF:</strong><br>${colaborador.documentos?.cpf || '-'}</div>
                <div><strong>RG:</strong><br>${colaborador.documentos?.rg || '-'}</div>
                <div><strong>Data Nascimento:</strong><br>${formatarData(colaborador.data_nascimento)}</div>
                <div><strong>Sexo:</strong><br>${colaborador.sexo}</div>
                <div><strong>Estado Civil:</strong><br>${colaborador.estado_civil}</div>
                <div><strong>Escolaridade:</strong><br>${colaborador.escolaridade}</div>
              </div>
              ${colaborador.nome_mae ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                    <div><strong>Nome da Mãe:</strong><br>${colaborador.nome_mae}</div>
                    <div><strong>Nome do Pai:</strong><br>${colaborador.nome_pai || 'Não informado'}</div>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Endereço e Contato -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🏠 Endereço e Contato</h3>
              <div style="font-size: 14px;">
                <div style="margin-bottom: 12px;">
                  <strong>Endereço:</strong><br>
                  ${colaborador.endereco}<br>
                  ${colaborador.cidade}/${colaborador.estado}<br>
                  CEP: ${colaborador.cep}
                </div>
                ${colaborador.contato_emergencia ? `
                  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <strong>Contato de Emergência:</strong><br>
                    ${colaborador.contato_emergencia.nome}<br>
                    ${colaborador.contato_emergencia.telefone} (${colaborador.contato_emergencia.parentesco})
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Informações Profissionais -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🏢 Informações Profissionais</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                <div><strong>Cargo:</strong><br>${colaborador.cargo}</div>
                <div><strong>Departamento:</strong><br>${colaborador.departamento}</div>
                <div><strong>Tipo de Contrato:</strong><br>${colaborador.tipo_contrato}</div>
                <div><strong>Data de Admissão:</strong><br>${formatarData(colaborador.data_admissao)}</div>
                <div style="grid-column: 1 / -1; margin-top: 8px;">
                  <strong>Salário Base:</strong><br>
                  <span style="font-size: 18px; color: #10b981; font-weight: bold;">${formatarMoeda(colaborador.salario_base)}</span>
                </div>
              </div>
            </div>

            <!-- Documentos Profissionais -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">📄 Documentos Profissionais</h3>
              ${colaborador.documentos ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                  <div><strong>CTPS:</strong><br>${colaborador.documentos.ctps}${colaborador.documentos.ctps_serie ? ` - Série ${colaborador.documentos.ctps_serie}` : ''}</div>
                  <div><strong>PIS/PASEP:</strong><br>${colaborador.documentos.pis_pasep || '-'}</div>
                  <div><strong>Título de Eleitor:</strong><br>${colaborador.documentos.titulo_eleitor || '-'}</div>
                  <div><strong>Reservista:</strong><br>${colaborador.documentos.reservista || '-'}</div>
                </div>
              ` : '<p style="color: #6b7280;">Documentos não informados</p>'}
            </div>

          </div>

          <!-- Benefícios -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">❤️ Benefícios</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-size: 14px;">
              <div style="text-align: center;">
                <div style="background: ${colaborador.beneficios?.vale_refeicao ? '#10b981' : '#6b7280'}; color: white; padding: 8px; border-radius: 4px; margin-bottom: 4px;">
                  Vale Refeição
                </div>
                <small>${colaborador.beneficios?.vale_refeicao ? 'Ativo' : 'Inativo'}</small>
                ${colaborador.beneficios?.valor_vale_refeicao ? `<br><small>${formatarMoeda(colaborador.beneficios.valor_vale_refeicao)}</small>` : ''}
              </div>
              <div style="text-align: center;">
                <div style="background: ${colaborador.beneficios?.vale_transporte ? '#10b981' : '#6b7280'}; color: white; padding: 8px; border-radius: 4px; margin-bottom: 4px;">
                  Vale Transporte
                </div>
                <small>${colaborador.beneficios?.vale_transporte ? 'Ativo' : 'Inativo'}</small>
                ${colaborador.beneficios?.valor_vale_transporte ? `<br><small>${formatarMoeda(colaborador.beneficios.valor_vale_transporte)}</small>` : ''}
              </div>
              <div style="text-align: center;">
                <div style="background: ${colaborador.beneficios?.plano_saude ? '#10b981' : '#6b7280'}; color: white; padding: 8px; border-radius: 4px; margin-bottom: 4px;">
                  Plano de Saúde
                </div>
                <small>${colaborador.beneficios?.plano_saude ? 'Ativo' : 'Inativo'}</small>
              </div>
              <div style="text-align: center;">
                <div style="background: ${colaborador.beneficios?.plano_odontologico ? '#10b981' : '#6b7280'}; color: white; padding: 8px; border-radius: 4px; margin-bottom: 4px;">
                  Plano Odontológico
                </div>
                <small>${colaborador.beneficios?.plano_odontologico ? 'Ativo' : 'Inativo'}</small>
              </div>
            </div>
          </div>

          <!-- Dados Bancários -->
          ${colaborador.dados_bancarios ? `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🏦 Dados Bancários</h3>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 14px;">
                <div><strong>Banco:</strong><br>${colaborador.dados_bancarios.banco}</div>
                <div><strong>Agência:</strong><br>${colaborador.dados_bancarios.agencia}</div>
                <div><strong>Conta:</strong><br>${colaborador.dados_bancarios.conta} (${colaborador.dados_bancarios.tipo_conta})</div>
                ${colaborador.dados_bancarios.pix ? `<div><strong>PIX:</strong><br>${colaborador.dados_bancarios.pix}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <p style="margin: 4px 0 0 0; font-weight: bold;">PLAN > CHECK > CONTROL - Sistema de Gestão de RH</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Capturar o conteúdo como imagem
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: tempDiv.scrollHeight
      });

      document.body.removeChild(tempDiv);

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar a primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf;

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para o PDF simples
      return generateSimpleColaboradorPdf(colaborador);
    }
  };

  const generateSimpleColaboradorPdf = (colaborador: Colaborador) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Header com logo
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 210, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('PLAN > CHECK > CONTROL', 20, 15);
    pdf.setFontSize(12);
    pdf.text('Relatório de Colaborador', 20, 23);
    
    // Informações pessoais
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text('Informações Pessoais', 20, 45);
    
    pdf.setFontSize(10);
    let y = 55;
    const addField = (label: string, value: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, 20, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value || '-', 60, y);
      y += 7;
    };

    addField('Nome', colaborador.nome);
    addField('Email', colaborador.email);
    addField('Cargo', colaborador.cargo);
    addField('Departamento', colaborador.departamento);
    addField('Status', colaborador.status);
    addField('Data de Admissão', new Date(colaborador.data_admissao).toLocaleDateString('pt-BR'));
    addField('Data de Nascimento', new Date(colaborador.data_nascimento).toLocaleDateString('pt-BR'));
    addField('Sexo', colaborador.sexo);
    addField('Salário Base', `R$ ${colaborador.salario_base.toLocaleString('pt-BR')}`);
    
    y += 10;
    pdf.setFontSize(14);
    pdf.text('Documentos', 20, y);
    y += 10;
    pdf.setFontSize(10);
    
    if (colaborador.documentos) {
      addField('CPF', colaborador.documentos.cpf);
      addField('RG', colaborador.documentos.rg);
      addField('CTPS', colaborador.documentos.ctps);
      addField('PIS/PASEP', colaborador.documentos.pis_pasep);
    }
    
    y += 10;
    pdf.setFontSize(14);
    pdf.text('Benefícios', 20, y);
    y += 10;
    pdf.setFontSize(10);
    
    if (colaborador.beneficios) {
      addField('Vale Transporte', colaborador.beneficios.vale_transporte ? 'Sim' : 'Não');
      addField('Vale Refeição', colaborador.beneficios.vale_refeicao ? 'Sim' : 'Não');
      addField('Plano de Saúde', colaborador.beneficios.plano_saude ? 'Sim' : 'Não');
      addField('Plano Odontológico', colaborador.beneficios.plano_odontologico ? 'Sim' : 'Não');
    }

    // Footer
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 280, 210, 17, 'F');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), 20, 290);
    pdf.text('PLAN > CHECK > CONTROL - Sistema de Gestão de RH', 140, 290);

    return pdf;
  };

  const generateEmpresaPdf = async (empresa: Empresa) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 210, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('PLAN > CHECK > CONTROL', 20, 15);
    pdf.setFontSize(12);
    pdf.text('Relatório da Empresa', 20, 23);
    
    // Informações da empresa
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text('Informações da Empresa', 20, 45);
    
    pdf.setFontSize(12);
    let y = 55;
    pdf.text(`Nome: ${empresa.nome}`, 20, y);
    y += 10;
    pdf.text(`CNPJ: ${empresa.cnpj}`, 20, y);
    y += 10;
    pdf.text(`Endereço: ${empresa.endereco}`, 20, y);
    
    // Lista de colaboradores
    y += 20;
    pdf.setFontSize(16);
    pdf.text('Colaboradores', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    colaboradores.forEach((colab, index) => {
      if (y > 260) { // Nova página se necessário
        pdf.addPage();
        y = 20;
      }
      
      pdf.text(`${index + 1}. ${colab.nome} - ${colab.cargo} (${colab.departamento})`, 25, y);
      y += 7;
      pdf.text(`   Email: ${colab.email} | Status: ${colab.status}`, 25, y);
      y += 10;
    });
    
    // Footer
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 280, 210, 17, 'F');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), 20, 290);
    pdf.text('PLAN > CHECK > CONTROL - Sistema de Gestão de RH', 140, 290);

    return pdf;
  };

  const handleExport = async () => {
    try {
      let pdf: jsPDF;
      let filename: string;

      if (type === 'colaborador') {
        pdf = await generateColaboradorPdf(data as Colaborador);
        filename = `colaborador-${(data as Colaborador).nome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      } else {
        pdf = await generateEmpresaPdf(data as Empresa);
        filename = `empresa-${(data as Empresa).nome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      }

      pdf.save(filename);
      
      toast({
        title: "PDF gerado com sucesso",
        description: `O relatório foi baixado como ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Exportar PDF
    </Button>
  );
}