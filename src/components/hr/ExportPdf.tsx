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