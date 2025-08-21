import { authMiddleware } from '@/auth/middleware';
import apiRoutes from '@/routes';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS global
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

app.use('/api/*', authMiddleware);

app.route('/api', apiRoutes);

export default app;
