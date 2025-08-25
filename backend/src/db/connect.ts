import { aiResults } from '@/db/schemas/gemini';
import { geoPoints } from '@/db/schemas/geo';
import { points } from '@/db/schemas/points';
import { polygons } from '@/db/schemas/polygon';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    geoPoints,
    polygons,
    points,
    aiResults,
  },
});

export type DB = typeof db;
