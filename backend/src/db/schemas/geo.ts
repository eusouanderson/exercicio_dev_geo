import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const geoPoints = pgTable('geo_points', {
  id: serial('id').primaryKey(),
  lat: text('lat').notNull(),
  lon: text('lon').notNull(),
  info: jsonb('info').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type GeoPoint = typeof geoPoints.$inferSelect;
export type NewGeoPoint = typeof geoPoints.$inferInsert;
