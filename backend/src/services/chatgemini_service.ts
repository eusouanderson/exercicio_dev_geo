import * as aiRepository from '@/repository/gemini_repository';
import type { GeminiResponse } from '@/types/gemini';

export async function analyzeGeographyPrompt(prompt: string): Promise<string> {
  try {
    const url = `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erro na API Gemini: ${res.status} - ${errText}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    await aiRepository.createAIResult({
      prompt,
      result: resultText,
      metadata: {
        model: 'gemini-pro',
        status: 'success',
        rawResponse: data,
      },
    });

    return resultText;
  } catch (err: any) {
    console.error('Erro ao chamar Gemini API:', err);

    await aiRepository.createAIResult({
      prompt,
      result: '',
      metadata: {
        model: 'gemini-pro',
        status: 'error',
        errorMessage: err.message,
      },
    });

    return '';
  }
}

export const listResults = aiRepository.findAllAIResults;
export const getResultById = aiRepository.findAIResultById;
export const deleteResult = aiRepository.deleteAIResult;
export const updateResult = aiRepository.updateAIResult;
