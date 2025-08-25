import { swaggerSpec } from '@/swagger';
import { Hono } from 'hono';

const swaggerRoute = new Hono();

swaggerRoute.get('/', (c) => {
  const specJson = JSON.stringify(swaggerSpec).replace(/</g, '\\u003c');
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Docs</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            spec: ${specJson},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ]
          });
        </script>
      </body>
    </html>
  `);
});
export default swaggerRoute;
