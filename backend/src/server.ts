import app from '@/app';

export default {
  port: process.env.PORT || 3002,
  fetch: app.fetch,
};

app.use('*', (c, next) => {
  console.log(`[Hono] ${c.req.method} ${c.req.url}`);
  return next();
});
