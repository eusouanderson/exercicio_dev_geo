export const polygonsSchemas = {
  PolygonProperties: {
    type: 'object',
    description: 'Propriedades estatísticas do polígono',
    properties: {
      totalPoints: { type: 'integer', example: 3 },
      sum: { type: 'number', example: 25 },
      average: { type: 'number', example: 8.33 },
      median: { type: 'number', example: 5 },
    },
  },

  Polygon: {
    type: 'object',
    properties: {
      id: { type: 'number', example: 2 },
      name: { type: 'string', example: 'Meu Polígono' },
      coordinates: {
        type: 'string',
        description: 'Lista de coordenadas em string JSON',
        example: '[[-46.63331,-23.55052],[-46.634,-23.5505],[-46.6335,-23.551]]',
      },
      properties: { $ref: '#/components/schemas/PolygonProperties' },
    },
    required: ['name', 'coordinates'],
  },

  PolygonInput: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Meu Polígono' },
      coordinates: {
        type: 'array',
        description: 'Array de coordenadas [longitude, latitude]',
        items: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2,
        },
        example: [
          [-46.63331, -23.55052],
          [-46.634, -23.5505],
          [-46.6335, -23.551],
        ],
      },
      pointsInside: {
        type: 'array',
        description: 'Valores associados aos pontos dentro do polígono',
        items: { type: 'number' },
        example: [5, 5, 15],
      },
    },
    required: ['name', 'coordinates', 'pointsInside'],
  },
};

export const polygonsPaths = {
  '/api/polygons': {
    get: {
      summary: 'Lista todos os polígonos',
      tags: ['Polygons'],
      responses: {
        200: {
          description: 'Lista de polígonos persistidos',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Polygon' },
              },
            },
          },
        },
        401: { description: 'Não autorizado' },
      },
    },
    post: {
      summary: 'Cria um novo polígono',
      tags: ['Polygons'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PolygonInput' },
          },
        },
      },
      responses: {
        201: {
          description: 'Polígono criado com sucesso',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Polygon' } } },
        },
        400: { description: 'Dados inválidos' },
        401: { description: 'Não autorizado' },
      },
    },
  },

  '/api/polygons/{id}': {
    get: {
      summary: 'Busca polígono por ID',
      tags: ['Polygons'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      responses: {
        200: {
          description: 'Polígono encontrado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Polygon' } } },
        },
        404: { description: 'Polígono não encontrado' },
        401: { description: 'Não autorizado' },
      },
    },
    put: {
      summary: 'Atualiza um polígono existente',
      tags: ['Polygons'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/PolygonInput' } } },
      },
      responses: {
        200: {
          description: 'Polígono atualizado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Polygon' } } },
        },
        404: { description: 'Polígono não encontrado' },
        401: { description: 'Não autorizado' },
      },
    },
    delete: {
      summary: 'Deleta um polígono por ID',
      tags: ['Polygons'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      responses: {
        204: { description: 'Polígono deletado com sucesso' },
        404: { description: 'Polígono não encontrado' },
        401: { description: 'Não autorizado' },
      },
    },
  },
};
