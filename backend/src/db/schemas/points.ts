import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const points = pgTable('points', {
  id: serial('id').primaryKey(),
  lat: text('lat').notNull(),
  lon: text('lon').notNull(),
  info: jsonb('info').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type sPoints = typeof points.$inferSelect;
export type NewPoint = typeof points.$inferInsert;
