import { geminiPaths, geminiSchemas } from './gemini';
import { geoPaths, geoSchemas } from './geo';
import { pointsPaths, pointsSchemas } from './points';
import { polygonsPaths, polygonsSchemas } from './polygons';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Exercicio Dev Geo API',
    version: '1.0.0',
    description: 'Documentação das rotas do projeto Geo',
  },
  servers: [{ url: 'http://localhost:3002', description: 'Servidor local' }],
  paths: {
    ...geoPaths,
    ...pointsPaths,
    ...polygonsPaths,
    ...geminiPaths,
  },
  components: {
    schemas: {
      ...geoSchemas,
      ...pointsSchemas,
      ...polygonsSchemas,
      ...geminiSchemas,
    },
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Digite seu token JWT para autenticação',
      },
    },
  },
  security: [{ BearerAuth: [] }],
};
