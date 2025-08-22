import { geoPoints } from '@/db/schemas/geo';
import { polygons } from '@/db/schemas/polygon';
//import { points } from '@/db/schemas/points'
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    geoPoints,
    polygons,
  },
});

export type DB = typeof db;
