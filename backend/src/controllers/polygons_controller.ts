import { polygonsRepository } from '@/repository/polygons_repository';
import { polygonsService } from '@/services/polygons_service';
import { Hono } from 'hono';

const app = new Hono();

app.post('/', async (c) => {
  const { name, coordinates, pointsInside } = await c.req.json();
  if (!name || !coordinates) return c.json({ error: 'Name and coordinates required' }, 400);
  console.log('Recebido no POST /polygons:', { name, coordinates, pointsInside });
  const polygon = await polygonsService.createPolygon({ name, coordinates, pointsInside });
  return c.json(polygon);
});

app.get('/', async (c) => {
  const polygons = await polygonsRepository.findAll();
  console.log('Get polygons enviado ', polygons);
  return c.json(polygons);
});

app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const polygon = await polygonsRepository.findById(id);
  if (!polygon) return c.json({ error: 'Polygon not found' }, 404);
  return c.json(polygon);
});

app.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const { name, coordinates, pointsInside } = await c.req.json();
  let properties;
  if (pointsInside) {
    const polygonWithProperties = await polygonsService.createPolygon({
      name,
      coordinates,
      pointsInside,
    });
    properties = polygonWithProperties.properties;
  }

  const updated = await polygonsRepository.update(id, { name, coordinates, properties });
  if (!updated) return c.json({ error: 'Polygon not found' }, 404);
  return c.json(updated);
});

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const deleted = await polygonsRepository.delete(id);
  if (!deleted) return c.json({ error: 'Polygon not found' }, 404);
  return c.json({ success: true });
});

export default app;
