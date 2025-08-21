import { json, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const polygons = pgTable('polygons', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  coordinates: text('coordinates'),
  properties: json('properties'),
});
