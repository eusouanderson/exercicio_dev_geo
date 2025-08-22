import { createGeoPoint, listPoints, reverseGeocode } from '@/controllers/geo_controller';
import { Hono } from 'hono';

const geoRoute = new Hono();

geoRoute.get('/geo/reverse', reverseGeocode);
geoRoute.get('/geo', listPoints);
geoRoute.post('/geo/create', createGeoPoint);
export default geoRoute;
