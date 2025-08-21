import { Hono } from 'hono';
import pointsRoutes from './points_routes';

const apiRoutes = new Hono();

apiRoutes.route('/', pointsRoutes);

export default apiRoutes;
