import polygonsController from '@/controllers/polygons_controller';
import { Hono } from 'hono';

const app = new Hono();

app.route('/polygons', polygonsController);

app.get('/polygons', (c) => {
  return c.json({ message: 'Rota de polígonos funcionando' });
});

export default app;
