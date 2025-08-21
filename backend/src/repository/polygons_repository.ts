import { db } from '@/db/connect';
import { polygons } from '@/db/schemas/polygon';
import { eq } from 'drizzle-orm';

export const polygonsRepository = {
  create: async (data: { name: string; coordinates: any; properties?: any }) => {
    const result = await db
      .insert(polygons)
      .values({
        name: data.name,
        coordinates: JSON.stringify(data.coordinates),
        properties: data.properties || {},
      })
      .returning();
    return result[0];
  },

  findAll: async () => {
    return db.select().from(polygons);
  },

  findById: async (id: number) => {
    const result = await db.select().from(polygons).where(eq(polygons.id, id));
    return result[0] || null;
  },

  update: async (id: number, data: { name?: string; coordinates?: any; properties?: any }) => {
    const result = await db
      .update(polygons)
      .set({
        name: data.name,
        coordinates: data.coordinates ? JSON.stringify(data.coordinates) : undefined,
        properties: data.properties,
      })
      .where(eq(polygons.id, id))
      .returning();
    return result[0] || null;
  },

  delete: async (id: number) => {
    const result = await db.delete(polygons).where(eq(polygons.id, id)).returning();
    return result[0] || null;
  },
};
