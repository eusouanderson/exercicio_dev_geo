import type { AdditionalData } from "@/types/analysis";
import type { AnalysisResult } from "@/types/map";

export function createAnalysisPrompt(
  analysis: AnalysisResult,
  additionalData: AdditionalData
): string {
  const { censusData, establishmentStats, dwellingStats } = additionalData;

  return `
Como especialista em análise geoespacial e socioeconômica, analise esta região com base nos seguintes dados:

INFORMAÇÕES GERAIS:
- Total de pontos analisados: ${analysis.totalPoints}
- Valor total: ${analysis.sum}
- Valor médio: ${analysis.mean.toFixed(2)}
- Mediana dos valores: ${analysis.median}

DADOS DO CENSO 2022:
- Total de estabelecimentos: ${establishmentStats.total}
- Estabelecimentos de construção: ${establishmentStats.construction}
- Estabelecimentos com outras finalidades: ${establishmentStats.otherPurposes}
- Total de domicílios: ${dwellingStats.total}
- Domicílios particulares: ${dwellingStats.particular}

DADOS DETALHADOS DO CENSO:
${Object.entries(censusData)
  .filter(([_, value]) => Number(value) > 0)
  .map(([key, value]) => `- ${key.replace(/_/g, " ").toUpperCase()}: ${value}`)
  .join("\n")}

ANÁLISE SOLICITADA:
Por favor, forneça uma análise completa incluindo:
1. Análise socioeconômica da área
2. Potencial de desenvolvimento e investimento
3. Recomendações para intervenções urbanas
4. Comparação com áreas similares
5. Insights sobre a distribuição espacial dos dados
6. Tendências e oportunidades identificadas
`;
}
