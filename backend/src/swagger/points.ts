export const pointsSchemas = {
  PointProperties: {
    type: 'object',
    description: 'Propriedades detalhadas de um ponto de interesse',
    properties: {
      latitude: { type: 'number', example: -20.339369 },
      longitude: { type: 'number', example: -50.610836 },
      censo_2022_estabelecimento_outras_finalidades_poi_counts: { type: 'integer', example: 0 },
      censo_2022_domicilio_particular_poi_counts: { type: 'integer', example: 0 },
      censo_2022_estabelecimento_construcao_poi_counts: { type: 'integer', example: 0 },
      censo_2022_estabelecimento_religioso_poi_counts: { type: 'integer', example: 0 },
      censo_2022_estabelecimento_ensino_poi_counts: { type: 'integer', example: 0 },
      censo_2022_estabelecimento_saude_poi_counts: { type: 'integer', example: 0 },
      censo_2022_domicilio_coletivo_poi_counts: { type: 'integer', example: 0 },
      censo_2022_estabelecimento_agro_poi_counts: { type: 'integer', example: 0 },
    },
    required: ['latitude', 'longitude'],
  },

  PointGeometry: {
    type: 'object',
    properties: {
      type: { type: 'string', example: 'Point' },
      coordinates: {
        type: 'array',
        items: { type: 'number' },
        example: [-50.610836, -20.339369],
      },
    },
    required: ['type', 'coordinates'],
  },

  PointFeature: {
    type: 'object',
    properties: {
      type: { type: 'string', example: 'Feature' },
      properties: { $ref: '#/components/schemas/PointProperties' },
      geometry: { $ref: '#/components/schemas/PointGeometry' },
    },
    required: ['type', 'properties', 'geometry'],
  },

  PointsFeatureCollection: {
    type: 'object',
    properties: {
      type: { type: 'string', example: 'FeatureCollection' },
      features: {
        type: 'array',
        items: { $ref: '#/components/schemas/PointFeature' },
      },
      total: { type: 'integer', example: 67766 },
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 1 },
    },
    required: ['type', 'features', 'total', 'page', 'limit'],
  },
};

export const pointsPaths = {
  '/api/points': {
    get: {
      summary: 'Lista todos os pontos de interesse',
      description:
        'Retorna todos os pontos de interesse em formato GeoJSON, com suporte a paginação via query params `page` e `limit`.',
      tags: ['Points'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Número da página (padrão: 1)',
          required: false,
          schema: { type: 'integer', example: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Número de itens por página (padrão: 100)',
          required: false,
          schema: { type: 'integer', example: 100 },
        },
      ],
      responses: {
        200: {
          description: 'Lista de pontos de interesse com propriedades detalhadas e geometria',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PointsFeatureCollection' },
              examples: {
                single: {
                  summary: 'Exemplo de um ponto',
                  value: {
                    type: 'FeatureCollection',
                    features: [
                      {
                        type: 'Feature',
                        properties: {
                          latitude: -20.339369,
                          longitude: -50.610836,
                          censo_2022_estabelecimento_outras_finalidades_poi_counts: 0,
                          censo_2022_domicilio_particular_poi_counts: 0,
                          censo_2022_estabelecimento_construcao_poi_counts: 0,
                          censo_2022_estabelecimento_religioso_poi_counts: 0,
                          censo_2022_estabelecimento_ensino_poi_counts: 0,
                          censo_2022_estabelecimento_saude_poi_counts: 0,
                          censo_2022_domicilio_coletivo_poi_counts: 0,
                          censo_2022_estabelecimento_agro_poi_counts: 0,
                        },
                        geometry: {
                          type: 'Point',
                          coordinates: [-50.610836, -20.339369],
                        },
                      },
                    ],
                    total: 67766,
                    page: 1,
                    limit: 1,
                  },
                },
              },
            },
          },
        },
        401: { description: 'Não autorizado / Token inválido' },
        500: { description: 'Erro interno do servidor' },
      },
    },
  },
};
