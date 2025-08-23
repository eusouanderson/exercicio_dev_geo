interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
      role?: string;
    };
    finishReason?: string;
    index?: number;
  }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    promptTokensDetails?: { modality?: string; tokenCount?: number }[];
    thoughtsTokenCount?: number;
  };
  modelVersion?: string;
  responseId?: string;
}

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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err: any) {
    console.error('Erro ao chamar Gemini API:', err);
    return '';
  }
}
