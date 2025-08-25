import {
  createGeoPoint,
  deleteGeoPointController,
  getGeoPointById,
  listPoints,
  reverseGeocode,
  updateGeoPointController,
} from '@/controllers/geo_controller';
import { Hono } from 'hono';

const geoRoute = new Hono();

geoRoute.get('/geo', listPoints);
geoRoute.get('/geo/reverse', reverseGeocode);
geoRoute.post('/geo', createGeoPoint);
geoRoute.get('/geo/:id', getGeoPointById);
geoRoute.put('/geo/:id', updateGeoPointController);
geoRoute.delete('/geo/:id', deleteGeoPointController);

export default geoRoute;
