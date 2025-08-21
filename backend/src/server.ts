import app from '@/app';

export default {
  port: process.env.PORT || 3002,
  fetch: app.fetch,
};
