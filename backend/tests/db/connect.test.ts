import { db } from '@/db/connect';
import { describe, expect, it } from 'bun:test';

// teste simples de conexão com o db
describe('Database connection', () => {
  it('should export db', () => {
    expect(db).toBeDefined();
  });
});
