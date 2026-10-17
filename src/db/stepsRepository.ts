import { getDatabase } from './database';

export type StepsEntry = {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD format
  steps: number;
  created_at: number;
};

export type StepsEntryInput = Omit<StepsEntry, 'id' | 'account_id' | 'created_at'>;

/**
 * Add or update a steps entry for a specific date
 */
export const upsertStepsEntry = async (
  accountId: string,
  stepsInput: StepsEntryInput
): Promise<StepsEntry> => {
  const db = getDatabase();

  const timestamp = Date.now();

  // Check if entry already exists for this date
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM steps_history WHERE account_id = ? AND date = ?',
    [accountId, stepsInput.date]
  );

  if (existing) {
    // Update existing entry
    await db.runAsync(`
      UPDATE steps_history SET
        steps = ?,
        created_at = ?
      WHERE account_id = ? AND date = ?
    `, [
      stepsInput.steps,
      timestamp,
      accountId,
      stepsInput.date
    ]);

    // Return the updated entry
    const entry = await db.getFirstAsync<StepsEntry>(
      'SELECT * FROM steps_history WHERE account_id = ? AND date = ?',
      [accountId, stepsInput.date]
    );

    if (!entry) {
      throw new Error('Failed to retrieve updated steps entry');
    }

    return entry;
  } else {
    // Create new entry
    const id = `steps-${accountId}-${stepsInput.date}-${Math.random().toString(36).substr(2, 9)}`;

    await db.runAsync(`
      INSERT INTO steps_history (
        id, account_id, date, steps, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      id,
      accountId,
      stepsInput.date,
      stepsInput.steps,
      timestamp
    ]);

    // Return the created entry
    const entry = await db.getFirstAsync<StepsEntry>(
      'SELECT * FROM steps_history WHERE id = ?',
      [id]
    );

    if (!entry) {
      throw new Error('Failed to retrieve created steps entry');
    }

    return entry;
  }
};

/**
 * Get steps history for an account, ordered by date descending
 */
export const getStepsHistory = async (
  accountId: string,
  limit?: number
): Promise<StepsEntry[]> => {
  const db = getDatabase();

  let query = `
    SELECT * FROM steps_history
    WHERE account_id = ?
    ORDER BY date DESC, created_at DESC
  `;

  const params: any[] = [accountId];

  if (limit !== undefined) {
    query += ' LIMIT ?';
    params.push(limit);
  }

  const entries = await db.getAllAsync<StepsEntry>(query, params);
  return entries;
};

/**
 * Get the most recent steps entry for an account
 */
export const getLatestSteps = async (accountId: string): Promise<StepsEntry | null> => {
  const db = getDatabase();

  const entry = await db.getFirstAsync<StepsEntry>(`
    SELECT * FROM steps_history
    WHERE account_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [accountId]);

  return entry ?? null;
};

/**
 * Get steps entry for a specific date
 */
export const getStepsByDate = async (
  accountId: string,
  date: string
): Promise<StepsEntry | null> => {
  const db = getDatabase();

  const entry = await db.getFirstAsync<StepsEntry>(`
    SELECT * FROM steps_history
    WHERE account_id = ? AND date = ?
  `, [accountId, date]);

  return entry ?? null;
};