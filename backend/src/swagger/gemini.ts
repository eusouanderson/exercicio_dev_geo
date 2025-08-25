export const geminiSchemas = {
  GeminiPrompt: {
    type: 'object',
    description: 'Prompt enviado para o modelo Gemini',
    properties: {
      id: { type: 'number', example: 1 },
      prompt: { type: 'string', example: 'Qual o meu nome?' },
      result: { type: 'string', example: 'Seu nome é Anderson' },
      createdAt: { type: 'string', format: 'date-time', example: '2025-08-24T20:00:00Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-08-24T20:05:00Z' },
    },
    required: ['prompt'],
  },
  GeminiPromptInput: {
    type: 'object',
    properties: {
      prompt: { type: 'string', example: 'Qual o meu nome?' },
    },
    required: ['prompt'],
  },
  GeminiResultUpdate: {
    type: 'object',
    properties: {
      result: { type: 'string', example: 'Resposta atualizada para teste' },
    },
    required: ['result'],
  },
};

export const geminiPaths = {
  '/gemini': {
    post: {
      summary: 'Envia um prompt para o Gemini',
      tags: ['Gemini'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GeminiPromptInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Prompt enviado com sucesso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GeminiPrompt' },
            },
          },
        },
        400: { description: 'Prompt inválido' },
        401: { description: 'Não autorizado / Token inválido' },
      },
    },
  },

  '/gemini/results': {
    get: {
      summary: 'Lista todos os resultados de prompts enviados',
      tags: ['Gemini'],
      responses: {
        200: {
          description: 'Lista de prompts e resultados',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/GeminiPrompt' },
              },
              examples: {
                sample: {
                  value: [
                    {
                      id: 1,
                      prompt: 'Qual o meu nome?',
                      result: 'Seu nome é Anderson',
                      createdAt: '2025-08-24T20:00:00Z',
                      updatedAt: '2025-08-24T20:05:00Z',
                    },
                  ],
                },
              },
            },
          },
        },
        401: { description: 'Não autorizado' },
      },
    },
  },

  '/gemini/results/{id}': {
    get: {
      summary: 'Busca resultado de prompt por ID',
      tags: ['Gemini'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      responses: {
        200: {
          description: 'Resultado do prompt',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/GeminiPrompt' } },
          },
        },
        404: { description: 'Prompt não encontrado' },
        401: { description: 'Não autorizado' },
      },
    },
    put: {
      summary: 'Atualiza o resultado de um prompt',
      tags: ['Gemini'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/GeminiResultUpdate' } },
        },
      },
      responses: {
        200: {
          description: 'Resultado atualizado com sucesso',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/GeminiPrompt' } },
          },
        },
        404: { description: 'Prompt não encontrado' },
        401: { description: 'Não autorizado' },
      },
    },
    delete: {
      summary: 'Deleta resultado de prompt por ID',
      tags: ['Gemini'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      responses: {
        204: { description: 'Prompt deletado com sucesso' },
        404: { description: 'Prompt não encontrado' },
        401: { description: 'Não autorizado' },
      },
    },
  },
};
