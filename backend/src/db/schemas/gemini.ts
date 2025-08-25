import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const aiResults = pgTable('ai_results', {
  id: serial('id').primaryKey(),
  prompt: text('prompt').notNull(),
  result: text('result').notNull(),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type AIResult = typeof aiResults.$inferSelect;
export type NewAIResult = typeof aiResults.$inferInsert;
