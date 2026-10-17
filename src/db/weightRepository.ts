import { getDatabase } from './database';

export type WeightEntry = {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD format
  kg: number;
  created_at: number;
};

export type WeightEntryInput = Omit<WeightEntry, 'id' | 'account_id' | 'created_at'>;

/**
 * Add a weight entry
 */
export const addWeightEntry = async (
  accountId: string,
  weightInput: WeightEntryInput
): Promise<WeightEntry> => {
  const db = getDatabase();

  const id = `weight-${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  await db.runAsync(`
    INSERT INTO weight_history (id, account_id, date, kg, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [
    id,
    accountId,
    weightInput.date,
    weightInput.kg,
    timestamp
  ]);

  // Return the created entry
  const entry = await db.getFirstAsync<WeightEntry>(
    'SELECT * FROM weight_history WHERE id = ?',
    [id]
  );

  if (!entry) {
    throw new Error('Failed to retrieve created weight entry');
  }

  return entry;
};

/**
 * Get weight history for an account, ordered by date descending
 */
export const getWeightHistory = async (
  accountId: string,
  limit?: number
): Promise<WeightEntry[]> => {
  const db = getDatabase();

  let query = `
    SELECT * FROM weight_history
    WHERE account_id = ?
    ORDER BY date DESC, created_at DESC
  `;

  const params: any[] = [accountId];

  if (limit !== undefined) {
    query += ' LIMIT ?';
    params.push(limit);
  }

  const entries = await db.getAllAsync<WeightEntry>(query, params);
  return entries;
};

/**
 * Get the most recent weight entry for an account
 */
export const getLatestWeight = async (accountId: string): Promise<WeightEntry | null> => {
  const db = getDatabase();

  const entry = await db.getFirstAsync<WeightEntry>(`
    SELECT * FROM weight_history
    WHERE account_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [accountId]);

  return entry ?? null;
};