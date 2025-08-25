export const geoSchemas = {
  GeoPoint: {
    type: 'object',
    description: 'Representa um ponto geográfico persistido',
    properties: {
      id: { type: 'number', example: 468 },
      lat: { type: 'string', example: '40.748817' },
      lon: { type: 'string', example: '-73.985428' },
      info: {
        type: 'object',
        description: 'Informações adicionais do ponto (ex: endereço, bairro, cidade, estado)',
        example: {
          address: '350 5th Ave, New York, NY 10118, USA',
          city: 'New York',
          state: 'NY',
          country: 'USA',
        },
      },
      createdAt: { type: 'string', format: 'date-time', example: '2025-08-24T19:00:00Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-08-24T19:30:00Z' },
    },
    required: ['lat', 'lon'],
  },
};

export const geoPaths = {
  '/api/geo': {
    get: {
      summary: 'Lista todos os pontos geográficos',
      tags: ['Geo'],
      description: 'Retorna todos os pontos geográficos persistidos.',
      responses: {
        200: {
          description: 'Lista de pontos',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/GeoPoint' },
              },
              examples: {
                sample: {
                  value: [
                    {
                      id: 468,
                      lat: '40.748817',
                      lon: '-73.985428',
                      info: {
                        address: '350 5th Ave, New York, NY 10118, USA',
                        city: 'New York',
                        state: 'NY',
                        country: 'USA',
                      },
                      createdAt: '2025-08-24T19:00:00Z',
                      updatedAt: '2025-08-24T19:30:00Z',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: 'Cria um novo ponto geográfico',
      tags: ['Geo'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 40.7128 },
                lon: { type: 'number', example: -74.006 },
              },
              required: ['lat', 'lon'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Ponto criado com sucesso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GeoPoint' },
            },
          },
        },
      },
    },
  },

  '/api/geo/{id}': {
    get: {
      summary: 'Busca ponto geográfico por ID',
      tags: ['Geo'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      responses: {
        200: {
          description: 'Informações do ponto',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GeoPoint' } } },
        },
      },
    },
    put: {
      summary: 'Atualiza ponto geográfico por ID',
      tags: ['Geo'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 40.73061 },
                lon: { type: 'number', example: -73.935242 },
              },
              required: ['lat', 'lon'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Ponto atualizado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GeoPoint' } } },
        },
      },
    },
    delete: {
      summary: 'Deleta ponto geográfico por ID',
      tags: ['Geo'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
      responses: { 204: { description: 'Ponto deletado com sucesso' } },
    },
  },

  '/api/geo/reverse': {
    get: {
      summary: 'Consulta reverse geocoding',
      tags: ['Geo'],
      description: 'Retorna informações detalhadas de endereço para uma coordenada específica.',
      parameters: [
        {
          name: 'lat',
          in: 'query',
          required: true,
          schema: { type: 'number', example: 40.748817 },
        },
        {
          name: 'lon',
          in: 'query',
          required: true,
          schema: { type: 'number', example: -73.985428 },
        },
      ],
      responses: {
        200: {
          description: 'Informações detalhadas do ponto',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GeoPoint' } } },
        },
      },
    },
  },
};
