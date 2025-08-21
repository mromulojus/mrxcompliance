import { Colaborador } from '@/types/hr';

export interface CalculoRescisao {
  tipo: 'CLT' | 'PJ' | 'PF';
  mesesTrabalhados: number;
  feriasProporcionais: string;
  tercoFerias: string;
  decimoTerceiro: string;
  avisoPrevio: string;
  multaFgts: string;
  fgts?: string;
  totalEstimado: string;
}

export function calcularRescisao({ 
  tipoContrato, 
  dataAdmissao, 
  salarioMensal, 
  dataAtual = new Date() 
}: {
  tipoContrato: string;
  dataAdmissao: string;
  salarioMensal: number;
  dataAtual?: Date;
}): CalculoRescisao | { erro: string } {
  const admissao = new Date(dataAdmissao);
  const hoje = new Date(dataAtual);

  // Calcular meses trabalhados
  const anos = hoje.getFullYear() - admissao.getFullYear();
  const meses = hoje.getMonth() - admissao.getMonth();
  const totalMeses = (anos * 12) + meses;
  const mesesTrabalhados = Math.max(totalMeses, 0);

  // Avos proporcionais até o mês atual
  const avos = Math.min(12, hoje.getMonth() + 1); // Janeiro = 0

  // Verbas proporcionais
  const feriasProporcionais = (salarioMensal / 12) * avos;
  const tercoFerias = feriasProporcionais / 3;
  const decimoTerceiro = (salarioMensal / 12) * avos;
  const avisoPrevio = salarioMensal;

  // FGTS simulado (usado em PJ e CLT para base da multa)
  const fgtsSimulado = salarioMensal * 0.08 * mesesTrabalhados;

  // Multa de 40% sobre o FGTS
  const multaFgts = fgtsSimulado * 0.40;

  // Soma base comum
  const verbasBase = feriasProporcionais + tercoFerias + decimoTerceiro + avisoPrevio;

  // Tratamento de tipo de contrato
  if (!tipoContrato) {
    return { erro: "Tipo de contrato não informado." };
  }
  
  const tipo = tipoContrato.toUpperCase() as 'CLT' | 'PJ' | 'PF';

  if (tipo === 'CLT') {
    return {
      tipo: 'CLT',
      mesesTrabalhados,
      feriasProporcionais: feriasProporcionais.toFixed(2),
      tercoFerias: tercoFerias.toFixed(2),
      decimoTerceiro: decimoTerceiro.toFixed(2),
      avisoPrevio: avisoPrevio.toFixed(2),
      multaFgts: multaFgts.toFixed(2),
      totalEstimado: (verbasBase + multaFgts).toFixed(2)
    };
  }

  if (tipo === 'PJ' || tipo === 'PF') {
    return {
      tipo: tipo,
      mesesTrabalhados,
      feriasProporcionais: feriasProporcionais.toFixed(2),
      tercoFerias: tercoFerias.toFixed(2),
      decimoTerceiro: decimoTerceiro.toFixed(2),
      avisoPrevio: avisoPrevio.toFixed(2),
      fgts: fgtsSimulado.toFixed(2),
      multaFgts: multaFgts.toFixed(2),
      totalEstimado: (verbasBase + fgtsSimulado + multaFgts).toFixed(2)
    };
  }

  return { erro: "Tipo de contrato inválido. Use 'CLT', 'PJ' ou 'PF'." };
}

export function calcularRescisaoColaborador(colaborador: Colaborador): CalculoRescisao | { erro: string } {
  if (!colaborador.tipo_contrato) {
    return { erro: "Tipo de contrato não informado no colaborador." };
  }
  
  if (!colaborador.data_admissao) {
    return { erro: "Data de admissão não informada no colaborador." };
  }
  
  if (!colaborador.salario_base || colaborador.salario_base <= 0) {
    return { erro: "Salário base inválido no colaborador." };
  }

  return calcularRescisao({
    tipoContrato: colaborador.tipo_contrato,
    dataAdmissao: colaborador.data_admissao,
    salarioMensal: colaborador.salario_base
  });
}

export function calcularValorPrevisto(valorRescisao: number): number {
  // Valor previsto entre 40% e 70% do valor da rescisão
  const porcentagem = 0.4 + Math.random() * 0.3; // Entre 0.4 (40%) e 0.7 (70%)
  return valorRescisao * porcentagem;
}

export function calcularTotalRescisaoEmpresa(colaboradores: Colaborador[]): {
  totalRescisao: number;
  totalPrevisto: number;
  colaboradoresComCalculo: Array<{
    colaborador: Colaborador;
    rescisao: CalculoRescisao | { erro: string };
    valorPrevisto: number;
  }>;
} {
  let totalRescisao = 0;
  let totalPrevisto = 0;
  const colaboradoresComCalculo = [];

  for (const colaborador of colaboradores) {
    const rescisao = calcularRescisaoColaborador(colaborador);
    
    if ('totalEstimado' in rescisao) {
      const valorRescisao = parseFloat(rescisao.totalEstimado);
      const valorPrevisto = calcularValorPrevisto(valorRescisao);
      
      totalRescisao += valorRescisao;
      totalPrevisto += valorPrevisto;
      
      colaboradoresComCalculo.push({
        colaborador,
        rescisao,
        valorPrevisto
      });
    } else {
      colaboradoresComCalculo.push({
        colaborador,
        rescisao,
        valorPrevisto: 0
      });
    }
  }

  return {
    totalRescisao,
    totalPrevisto,
    colaboradoresComCalculo
  };
}