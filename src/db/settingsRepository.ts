import { getDatabase } from './database';

export type Settings = {
  id: string;
  account_id: string;
  theme_preference?: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  created_at: number;
  updated_at: number;
};

export type SettingsInput = Omit<Settings, 'id' | 'account_id' | 'created_at' | 'updated_at'>;

/**
 * Create or update settings for an account
 */
export const upsertSettings = async (
  accountId: string,
  settingsInput: SettingsInput
): Promise<Settings> => {
  const db = getDatabase();
  const timestamp = Date.now();

  // Check if settings already exist
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM settings WHERE account_id = ?',
    [accountId]
  );

  if (existing) {
    // Update existing settings
    await db.runAsync(`
      UPDATE settings SET
        theme_preference = ?,
        notifications_enabled = ?,
        updated_at = ?
      WHERE account_id = ?
    `, [
      settingsInput.theme_preference ?? null,
      settingsInput.notifications_enabled ? 1 : 0,
      timestamp,
      accountId
    ]);

    // Return the updated settings
    const updatedSettings = await db.getFirstAsync<Settings>(
      'SELECT * FROM settings WHERE account_id = ?',
      [accountId]
    );

    if (!updatedSettings) {
      throw new Error('Failed to retrieve updated settings');
    }

    return updatedSettings;
  } else {
    // Create new settings
    const id = `settings-${accountId}-${timestamp}`;

    await db.runAsync(`
      INSERT INTO settings (
        id, account_id, theme_preference, notifications_enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      accountId,
      settingsInput.theme_preference ?? null,
      settingsInput.notifications_enabled ? 1 : 0,
      timestamp,
      timestamp
    ]);

    // Return the created settings
    const createdSettings = await db.getFirstAsync<Settings>(
      'SELECT * FROM settings WHERE id = ?',
      [id]
    );

    if (!createdSettings) {
      throw new Error('Failed to retrieve created settings');
    }

    return createdSettings;
  }
};

/**
 * Get settings by account ID
 */
export const getSettingsByAccountId = async (accountId: string): Promise<Settings | null> => {
  const db = getDatabase();

  const settings = await db.getFirstAsync<Settings>(`
    SELECT * FROM settings WHERE account_id = ?
  `, [accountId]);

  return settings ?? null;
};