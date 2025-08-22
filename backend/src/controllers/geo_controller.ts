import { NewGeoPoint } from '@/db/schemas/geo';
import * as geoRepository from '@/repository/geo_repository';
import { NominatimService } from '@/services/nominatim_service';
import { Context } from 'hono';

export const listPoints = async (c: Context) => {
  try {
    const points = await geoRepository.findAllGeoPoints();
    return c.json(points, 200);
  } catch (error: any) {
    console.error('Erro ao listar pontos:', error);
    return c.json({ message: 'Erro ao buscar pontos geográficos', error: error.message }, 500);
  }
};

export const createGeoPoint = async (c: Context) => {
  const { lat, lon } = await c.req.json();

  if (!lat || !lon) {
    return c.json({ message: 'Latitude e longitude são obrigatórias' }, 400);
  }

  try {
    const locationInfo = await NominatimService.reverse(lat, lon);

    const newPointData: NewGeoPoint = {
      lat: String(lat),
      lon: String(lon),
      info: locationInfo,
    };

    const savedPoint = await geoRepository.createGeoPoint(newPointData);

    return c.json(savedPoint, 201);
  } catch (error: any) {
    console.error('Erro ao criar ponto:', error);
    return c.json({ message: 'Erro ao criar ponto geográfico', error: error.message }, 500);
  }
};

export const reverseGeocode = async (c: Context) => {
  const { lat, lon } = c.req.query();
  if (!lat || !lon) {
    return c.json({ message: 'Latitude e longitude são obrigatórias' }, 400);
  }

  try {
    const data = await NominatimService.reverse(Number(lat), Number(lon));
    return c.json(data, 200);
  } catch (error: any) {
    console.error('Erro no reverse geocode:', error);
    return c.json({ message: 'Erro no serviço de geocoding reverso', error: error.message }, 500);
  }
};
