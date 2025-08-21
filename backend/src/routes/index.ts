import pointsRoutes from '@/routes/points_route';
import polygonsRoutes from '@/routes/polygons_route';
import { Hono } from 'hono';

const apiRoutes = new Hono();

apiRoutes.route('/', pointsRoutes);
apiRoutes.route('/', polygonsRoutes);

export default apiRoutes;
