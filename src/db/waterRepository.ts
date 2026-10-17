import { getDatabase } from './database';

export type WaterEntry = {
  id: string;
  account_id: string;
  time: string; // HH:MM format
  amount_ml: number;
  date_key: string; // YYYY-MM-DD format
  created_at: number;
};

export type WaterEntryInput = Omit<WaterEntry, 'id' | 'account_id' | 'created_at'>;

/**
 * Add a water entry
 */
export const addWaterEntry = async (
  accountId: string,
  waterInput: WaterEntryInput
): Promise<WaterEntry> => {
  const db = getDatabase();

  const id = `water-${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  await db.runAsync(`
    INSERT INTO water_entries (id, account_id, time, amount_ml, date_key, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    id,
    accountId,
    waterInput.time,
    waterInput.amount_ml,
    waterInput.date_key,
    timestamp
  ]);

  // Return the created entry
  const entry = await db.getFirstAsync<WaterEntry>(
    'SELECT * FROM water_entries WHERE id = ?',
    [id]
  );

  if (!entry) {
    throw new Error('Failed to retrieve created water entry');
  }

  return entry;
};

/**
 * Get water entries for an account and date, ordered by time
 */
export const getWaterEntriesByDate = async (
  accountId: string,
  dateKey: string
): Promise<WaterEntry[]> => {
  const db = getDatabase();

  const entries = await db.getAllAsync<WaterEntry>(`
    SELECT * FROM water_entries
    WHERE account_id = ? AND date_key = ?
    ORDER BY time
  `, [accountId, dateKey]);

  return entries;
};

/**
 * Get total water consumption for an account on a specific date
 */
export const getTotalWaterByDate = async (
  accountId: string,
  dateKey: string
): Promise<number> => {
  const db = getDatabase();

  const result = await db.getFirstAsync<{ total_ml: number }>(`
    SELECT SUM(amount_ml) as total_ml
    FROM water_entries
    WHERE account_id = ? AND date_key = ?
  `, [accountId, dateKey]);

  return result?.total_ml ?? 0;
};