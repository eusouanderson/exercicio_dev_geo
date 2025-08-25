import {
  createPolygonController,
  deletePolygonController,
  getPolygonController,
  listPolygonsController,
  updatePolygonController,
} from '@/controllers/polygons_controller';
import { Hono } from 'hono';

const app = new Hono();

app.post('/polygons', createPolygonController);
app.get('/polygons', listPolygonsController);
app.get('/polygons/:id', getPolygonController);
app.put('/polygons/:id', updatePolygonController);
app.delete('/polygons/:id', deletePolygonController);

export default app;
