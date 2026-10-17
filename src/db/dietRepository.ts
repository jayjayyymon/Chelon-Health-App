import { getDatabase } from './database';

export type DietMeal = {
  id: string;
  account_id: string;
  name: string;
  meal: string;
  calories: number;
  date_key: string; // YYYY-MM-DD format
  created_at: string; // ISO timestamp
};

export type DietMealInput = Omit<DietMeal, 'id' | 'account_id' | 'created_at'>;

/**
 * Add a diet meal entry
 */
export const addDietMeal = async (
  accountId: string,
  mealInput: DietMealInput
): Promise<DietMeal> => {
  const db = getDatabase();

  const id = `meal-${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  await db.runAsync(`
    INSERT INTO diet_meals (id, account_id, name, meal, calories, date_key, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    accountId,
    mealInput.name,
    mealInput.meal,
    mealInput.calories,
    mealInput.date_key,
    timestamp
  ]);

  // Return the created entry
  const entry = await db.getFirstAsync<DietMeal>(
    'SELECT * FROM diet_meals WHERE id = ?',
    [id]
  );

  if (!entry) {
    throw new Error('Failed to retrieve created diet meal');
  }

  return entry;
};

/**
 * Get diet meals for an account and date
 */
export const getDietMealsByDate = async (
  accountId: string,
  dateKey: string
): Promise<DietMeal[]> => {
  const db = getDatabase();

  const entries = await db.getAllAsync<DietMeal>(`
    SELECT * FROM diet_meals
    WHERE account_id = ? AND date_key = ?
    ORDER BY created_at DESC
  `, [accountId, dateKey]);

  return entries;
};

/**
 * Update a diet meal
 */
export const updateDietMeal = async (
  accountId: string,
  mealId: string,
  updates: Partial<Omit<DietMeal, 'id' | 'account_id' | 'created_at'>>
): Promise<void> => {
  const db = getDatabase();

  // Build the SET clause dynamically
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    values.push(updates.name);
  }

  if (updates.meal !== undefined) {
    setClauses.push('meal = ?');
    values.push(updates.meal);
  }

  if (updates.calories !== undefined) {
    setClauses.push('calories = ?');
    values.push(updates.calories);
  }

  if (updates.date_key !== undefined) {
    setClauses.push('date_key = ?');
    values.push(updates.date_key);
  }

  if (setClauses.length === 0) {
    return; // Nothing to update
  }

  // Add WHERE clause values
  values.push(accountId);
  values.push(mealId);

  await db.runAsync(`
    UPDATE diet_meals
    SET ${setClauses.join(', ')}
    WHERE account_id = ? AND id = ?
  `, values);
};

/**
 * Remove a diet meal
 */
export const removeDietMeal = async (
  accountId: string,
  mealId: string
): Promise<void> => {
  const db = getDatabase();

  await db.runAsync(`
    DELETE FROM diet_meals
    WHERE account_id = ? AND id = ?
  `, [accountId, mealId]);
};

/**
 * Get total calories for an account on a specific date
 */
export const getTotalCaloriesByDate = async (
  accountId: string,
  dateKey: string
): Promise<number> => {
  const db = getDatabase();

  const result = await db.getFirstAsync<{ total_calories: number }>(`
    SELECT SUM(calories) as total_calories
    FROM diet_meals
    WHERE account_id = ? AND date_key = ?
  `, [accountId, dateKey]);

  return result?.total_calories ?? 0;
};