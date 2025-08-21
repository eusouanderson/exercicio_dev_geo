import { listPoints } from '@/controllers/points_controller';
import { Hono } from 'hono';

const pointsRoutes = new Hono();

pointsRoutes.get('/points', listPoints);

export default pointsRoutes;
