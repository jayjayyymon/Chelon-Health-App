import { getDatabase } from './database';

export type SleepEntry = {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD format
  hours: number;
  bedtime?: string; // HH:MM format
  wake_time?: string; // HH:MM format
  created_at: number;
};

export type SleepEntryInput = Omit<SleepEntry, 'id' | 'account_id' | 'created_at'>;

/**
 * Add or update a sleep entry for a specific date
 */
export const upsertSleepEntry = async (
  accountId: string,
  sleepInput: SleepEntryInput
): Promise<SleepEntry> => {
  const db = getDatabase();

  const timestamp = Date.now();

  // Check if entry already exists for this date
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM sleep_history WHERE account_id = ? AND date = ?',
    [accountId, sleepInput.date]
  );

  if (existing) {
    // Update existing entry
    await db.runAsync(`
      UPDATE sleep_history SET
        hours = ?,
        bedtime = ?,
        wake_time = ?,
        updated_at = ?
      WHERE account_id = ? AND date = ?
    `, [
      sleepInput.hours,
      sleepInput.bedtime ?? null,
      sleepInput.wake_time ?? null,
      timestamp,
      accountId,
      sleepInput.date
    ]);

    // Return the updated entry
    const entry = await db.getFirstAsync<SleepEntry>(
      'SELECT * FROM sleep_history WHERE account_id = ? AND date = ?',
      [accountId, sleepInput.date]
    );

    if (!entry) {
      throw new Error('Failed to retrieve updated sleep entry');
    }

    return entry;
  } else {
    // Create new entry
    const id = `sleep-${accountId}-${sleepInput.date}-${Math.random().toString(36).substr(2, 9)}`;

    await db.runAsync(`
      INSERT INTO sleep_history (
        id, account_id, date, hours, bedtime, wake_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      accountId,
      sleepInput.date,
      sleepInput.hours,
      sleepInput.bedtime ?? null,
      sleepInput.wake_time ?? null,
      timestamp
    ]);

    // Return the created entry
    const entry = await db.getFirstAsync<SleepEntry>(
      'SELECT * FROM sleep_history WHERE id = ?',
      [id]
    );

    if (!entry) {
      throw new Error('Failed to retrieve created sleep entry');
    }

    return entry;
  }
};

/**
 * Get sleep history for an account, ordered by date descending
 */
export const getSleepHistory = async (
  accountId: string,
  limit?: number
): Promise<SleepEntry[]> => {
  const db = getDatabase();

  let query = `
    SELECT * FROM sleep_history
    WHERE account_id = ?
    ORDER BY date DESC, created_at DESC
  `;

  const params: any[] = [accountId];

  if (limit !== undefined) {
    query += ' LIMIT ?';
    params.push(limit);
  }

  const entries = await db.getAllAsync<SleepEntry>(query, params);
  return entries;
};

/**
 * Get the most recent sleep entry for an account
 */
export const getLatestSleep = async (accountId: string): Promise<SleepEntry | null> => {
  const db = getDatabase();

  const entry = await db.getFirstAsync<SleepEntry>(`
    SELECT * FROM sleep_history
    WHERE account_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [accountId]);

  return entry ?? null;
};

/**
 * Get sleep entry for a specific date
 */
export const getSleepByDate = async (
  accountId: string,
  date: string
): Promise<SleepEntry | null> => {
  const db = getDatabase();

  const entry = await db.getFirstAsync<SleepEntry>(`
    SELECT * FROM sleep_history
    WHERE account_id = ? AND date = ?
  `, [accountId, date]);

  return entry ?? null;
};