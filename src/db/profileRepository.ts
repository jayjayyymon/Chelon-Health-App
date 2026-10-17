import { getDatabase } from './database';

export type Profile = {
  id: string;
  account_id: string;
  name: string;
  age: number;
  height_cm: number;
  goal_weight_kg: number;
  daily_water_goal_l: number;
  daily_step_goal: number;
  daily_sleep_goal_hours: number;
  daily_calorie_goal: number;
  wellness_status?: string;
  gender?: string;
  primary_health_goal?: string;
  created_at: number;
  updated_at: number;
};

export type ProfileInput = Omit<Profile, 'id' | 'account_id' | 'created_at' | 'updated_at'>;

/**
 * Create or update a profile for an account
 */
export const upsertProfile = async (
  accountId: string,
  profileInput: ProfileInput
): Promise<Profile> => {
  const db = getDatabase();
  const timestamp = Date.now();

  // Check if profile already exists
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM profiles WHERE account_id = ?',
    [accountId]
  );

  if (existing) {
    // Update existing profile
    await db.runAsync(`
      UPDATE profiles SET
        name = ?,
        age = ?,
        height_cm = ?,
        goal_weight_kg = ?,
        daily_water_goal_l = ?,
        daily_step_goal = ?,
        daily_sleep_goal_hours = ?,
        daily_calorie_goal = ?,
        wellness_status = ?,
        gender = ?,
        primary_health_goal = ?,
        updated_at = ?
      WHERE account_id = ?
    `, [
      profileInput.name,
      profileInput.age,
      profileInput.height_cm,
      profileInput.goal_weight_kg,
      profileInput.daily_water_goal_l,
      profileInput.daily_step_goal,
      profileInput.daily_sleep_goal_hours ?? null,
      profileInput.daily_calorie_goal,
      profileInput.wellness_status ?? null,
      profileInput.gender ?? null,
      profileInput.primary_health_goal ?? null,
      timestamp,
      accountId
    ]);

    // Return the updated profile
    const updatedProfile = await db.getFirstAsync<Profile>(
      'SELECT * FROM profiles WHERE account_id = ?',
      [accountId]
    );

    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }

    return updatedProfile;
  } else {
    // Create new profile
    const id = `profile-${accountId}-${timestamp}`;

    await db.runAsync(`
      INSERT INTO profiles (
        id, account_id, name, age, height_cm, goal_weight_kg,
        daily_water_goal_l, daily_step_goal, daily_sleep_goal_hours,
        daily_calorie_goal, wellness_status, gender, primary_health_goal,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      accountId,
      profileInput.name,
      profileInput.age,
      profileInput.height_cm,
      profileInput.goal_weight_kg,
      profileInput.daily_water_goal_l,
      profileInput.daily_step_goal,
      profileInput.daily_sleep_goal_hours ?? null,
      profileInput.daily_calorie_goal,
      profileInput.wellness_status ?? null,
      profileInput.gender ?? null,
      profileInput.primary_health_goal ?? null,
      timestamp,
      timestamp
    ]);

    // Return the created profile
    const createdProfile = await db.getFirstAsync<Profile>(
      'SELECT * FROM profiles WHERE id = ?',
      [id]
    );

    if (!createdProfile) {
      throw new Error('Failed to retrieve created profile');
    }

    return createdProfile;
  }
};

/**
 * Get profile by account ID
 */
export const getProfileByAccountId = async (accountId: string): Promise<Profile | null> => {
  const db = getDatabase();

  const profile = await db.getFirstAsync<Profile>(
    'SELECT * FROM profiles WHERE account_id = ?',
    [accountId]
  );

  return profile ?? null;
};