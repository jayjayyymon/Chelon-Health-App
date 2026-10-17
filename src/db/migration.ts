import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from './database';
import {
  loadProfile, saveProfile, clearProfileData
} from '@/utils/profileStorage';
import {
  loadWeightHistory, saveWeightHistory
} from '@/utils/weightStorage';
import {
  loadWaterGlasses, saveWaterGlasses
} from '@/utils/healthDataStorage';
import {
  loadSleepHistory, saveSleepHistory
} from '@/utils/healthDataStorage';
import {
  loadStepsHistory, saveStepsHistory
} from '@/utils/healthDataStorage';
import {
  loadDietMeals, saveDietMeals
} from '@/utils/dietStorage';
import { getLocalDateKey } from '@/utils/dietStorage';
import {
  getAppointments, saveAppointment as saveSqlAppointment, removeAppointment
} from '@/db/appointmentRepository';
import {
  loadThemePreference, saveThemePreference
} from '@/utils/themeStorage';
import {
  loadNotificationsEnabled, saveNotificationsEnabled
} from '@/utils/settingsStorage';
import { addWeightEntry } from './weightRepository';
import { addWaterEntry } from './waterRepository';
import { upsertSleepEntry } from './sleepRepository';
import { upsertStepsEntry } from './stepsRepository';
import { addDietMeal } from './dietRepository';
import { upsertProfile } from './profileRepository';
import { upsertSettings } from './settingsRepository';
import { createAccount } from './accountRepository';
import { hashPassword } from '@/utils/passwordUtils';

/**
 * Migrate data from AsyncStorage to SQLite for a given account
 * This should be called after a user creates or signs into an account
 */
export const migrateAsyncStorageToSQLite = async (
  accountId: string,
  email: string
): Promise<void> => {
  const db = getDatabase();

  try {
    // Start a transaction for better performance and atomicity
    await db.execAsync('BEGIN TRANSACTION;');

    // 1. Migrate profile data
    try {
      const profile = await loadProfile();
      if (profile) {
        await upsertProfile(accountId, {
          name: profile.name,
          age: profile.age,
          height_cm: profile.heightCm,
          goal_weight_kg: profile.goalWeightKg,
          daily_water_goal_l: profile.dailyWaterGoalL,
          daily_step_goal: profile.dailyStepGoal,
          daily_sleep_goal_hours: profile.dailySleepGoalHours,
          daily_calorie_goal: profile.dailyCalorieGoal,
          wellness_status: profile.wellnessStatus,
          gender: profile.gender,
          primary_health_goal: profile.primaryHealthGoal
        });
      }
    } catch (error) {
      console.warn('Failed to migrate profile:', error);
    }

    // 2. Migrate weight history
    try {
      const weightHistory = await loadWeightHistory();
      if (weightHistory) {
        for (const entry of weightHistory) {
          await addWeightEntry(accountId, {
            date: entry.date,
            kg: entry.kg
          });
        }
      }
    } catch (error) {
      console.warn('Failed to migrate weight history:', error);
    }

    // 3. Migrate water glasses
    try {
      const waterGlasses = await loadWaterGlasses();
      if (waterGlasses) {
        for (const glass of waterGlasses) {
          await addWaterEntry(accountId, {
            time: glass.time,
            amount_ml: glass.amountMl,
            date_key: glass.dateKey ?? getLocalDateKey()
          });
        }
      }
    } catch (error) {
      console.warn('Failed to migrate water glasses:', error);
    }

    // 4. Migrate sleep history
    try {
      const sleepHistory = await loadSleepHistory();
      if (sleepHistory) {
        for (const entry of sleepHistory) {
          await upsertSleepEntry(accountId, {
            date: entry.date,
            hours: entry.hours,
            bedtime: entry.bedtime,
            wake_time: entry.wakeTime
          });
        }
      }
    } catch (error) {
      console.warn('Failed to migrate sleep history:', error);
    }

    // 5. Migrate steps history
    try {
      const stepsHistory = await loadStepsHistory();
      if (stepsHistory) {
        for (const entry of stepsHistory) {
          await upsertStepsEntry(accountId, {
            date: entry.date,
            steps: entry.steps
          });
        }
      }
    } catch (error) {
      console.warn('Failed to migrate steps history:', error);
    }

    // 6. Migrate diet meals
    try {
      const dietMeals = await loadDietMeals();
      if (dietMeals) {
        for (const meal of dietMeals) {
          await addDietMeal(accountId, {
            name: meal.name,
            meal: meal.meal,
            calories: meal.calories,
            date_key: meal.dateKey ?? getLocalDateKey()
          });
        }
      }
    } catch (error) {
      console.warn('Failed to migrate diet meals:', error);
    }

    // 7. Migrate appointments
    try {
      const appointments = await getAppointments(accountId, false); // Get all appointments, not just upcoming
      if (appointments) {
        for (const appointment of appointments) {
          await saveSqlAppointment(accountId, {
            doctor_id: appointment.doctor_id,
            doctor_name: appointment.doctor_name,
            specialty: appointment.specialty,
            date: appointment.date,
            time: appointment.time,
            scheduled_at: appointment.scheduled_at
          });
        }
      }
    } catch (error) {
      console.warn('Failed to migrate appointments:', error);
    }

    // 8. Migrate theme preference
    try {
      const themePreference = await loadThemePreference();
      if (themePreference !== null) {
        await upsertSettings(accountId, {
          theme_preference: themePreference ?? null,
          notifications_enabled: false // Will be updated next
        });
      }
    } catch (error) {
      console.warn('Failed to migrate theme preference:', error);
    }

    // 9. Migrate notifications enabled
    try {
      const notificationsEnabled = await loadNotificationsEnabled();
      await upsertSettings(accountId, {
        theme_preference: undefined, // Will keep existing value
        notifications_enabled: notificationsEnabled
      });
    } catch (error) {
      console.warn('Failed to migrate notifications enabled:', error);
    }

    // Commit the transaction
    await db.execAsync('COMMIT;');

    console.log('Successfully migrated AsyncStorage data to SQLite');

  } catch (error) {
    // Rollback transaction on error
    try {
      await db.execAsync('ROLLBACK;');
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }

    console.error('Failed to migrate data from AsyncStorage to SQLite:', error);
    throw error;
  }
};

/**
 * Clear all AsyncStorage data after successful migration
 * This should only be called after confirming SQLite data is correct
 */
export const clearAsyncStorageAfterMigration = async (): Promise<void> => {
  try {
    const storageKeys = [
      '@healthapp_userProfile',
      '@healthapp_weightHistory',
      '@healthapp_waterGlasses',
      '@healthapp_sleepHistory',
      '@healthapp_stepsHistory',
      '@healthapp_dietMeals',
      '@healthapp_appointments',
      '@healthapp_theme',
      '@healthapp_notificationsEnabled'
    ];

    await Promise.all(
      storageKeys.map(key => AsyncStorage.removeItem(key))
    );

    console.log('Successfully cleared AsyncStorage after migration');
  } catch (error) {
    console.error('Failed to clear AsyncStorage:', error);
    throw error;
  }
};

/**
 * Create a temporary account for migration purposes
 * This is used when migrating data for the first time
 */
export const createMigrationAccount = async (
  email: string,
  password: string
): Promise<{ accountId: string; email: string }> => {
  // Check if account already exists
  const db = getDatabase();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM accounts WHERE email = ?',
    [email.toLowerCase().trim()]
  );

  if (existing) {
    throw new Error('Account with this email already exists');
  }

  // Create account
  const account = await createAccount({ email, password });

  return {
    accountId: account.id,
    email: account.email
  };
};