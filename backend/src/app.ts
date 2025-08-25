import { authMiddleware } from '@/auth/middleware';
import apiRoutes from '@/routes';
import swaggerRoute from '@/routes/swagger_route';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/', (c) => {
  return c.text('API do Projeto Geo está no ar!');
});

app.route('/docs', swaggerRoute);

app.use('/api/*', authMiddleware);

app.route('/api', apiRoutes);

export default app;
