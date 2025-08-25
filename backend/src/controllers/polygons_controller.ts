import { polygonsRepository } from '@/repository/polygons_repository';
import { polygonsService } from '@/services/polygons_service';
import { Context } from 'hono';

export const createPolygonController = async (c: Context) => {
  try {
    const { name, coordinates, pointsInside } = await c.req.json();
    if (!name || !coordinates) return c.json({ error: 'Name and coordinates required' }, 400);

    console.log('Recebido no POST /polygons:', { name, coordinates, pointsInside });

    const polygon = await polygonsService.createPolygon({ name, coordinates, pointsInside });
    return c.json(polygon, 201);
  } catch (error: any) {
    console.error('Erro ao criar polígono:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
};

export const listPolygonsController = async (c: Context) => {
  try {
    const polygons = await polygonsRepository.findAll();
    return c.json(polygons, 200);
  } catch (error: any) {
    console.error('Erro ao listar polígonos:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
};

export const getPolygonController = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    const polygon = await polygonsRepository.findById(id);
    if (!polygon) return c.json({ error: 'Polygon not found' }, 404);
    return c.json(polygon, 200);
  } catch (error: any) {
    console.error('Erro ao buscar polígono:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
};

export const updatePolygonController = async (c: Context) => {
  try {
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

    return c.json(updated, 200);
  } catch (error: any) {
    console.error('Erro ao atualizar polígono:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
};

export const deletePolygonController = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    const deleted = await polygonsRepository.delete(id);

    if (!deleted) {
      return c.json({ error: 'Polygon not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar polígono:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
};
