import { default as geoRoute, default as tilesRoute } from '@/routes/geo_route';
import pointsRoutes from '@/routes/points_route';
import polygonsRoutes from '@/routes/polygons_route';
import { Hono } from 'hono';

const apiRoutes = new Hono();

apiRoutes.route('/', pointsRoutes);
apiRoutes.route('/', polygonsRoutes);
apiRoutes.route('/', tilesRoute);
apiRoutes.route('/', geoRoute);

export default apiRoutes;
