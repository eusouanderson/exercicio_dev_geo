import { db } from '@/db/connect';
import { AIResult, aiResults, NewAIResult } from '@/db/schemas/gemini';
import { eq } from 'drizzle-orm';

export const createAIResult = async (data: NewAIResult): Promise<AIResult> => {
  const [inserted] = await db.insert(aiResults).values(data).returning();
  return inserted;
};

export const findAllAIResults = async (): Promise<AIResult[]> => {
  return await db.select().from(aiResults).orderBy(aiResults.createdAt);
};

export const findAIResultById = async (id: number): Promise<AIResult | null> => {
  const [result] = await db.select().from(aiResults).where(eq(aiResults.id, id));
  return result || null;
};

export const updateAIResult = async (
  id: number,
  data: Partial<NewAIResult>
): Promise<AIResult | null> => {
  const [updated] = await db
    .update(aiResults)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(aiResults.id, id))
    .returning();
  return updated || null;
};

export const deleteAIResult = async (id: number): Promise<boolean> => {
  const deleted = await db.delete(aiResults).where(eq(aiResults.id, id)).returning();
  return deleted.length > 0;
};
