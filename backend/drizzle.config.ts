import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './backend/drizzle',
  schema: './src/db/schemas',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
