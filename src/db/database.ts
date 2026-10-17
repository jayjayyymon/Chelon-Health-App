import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

// Database name and version
const DATABASE_NAME = 'chelondb.db';
const DATABASE_VERSION = 1;

// Global database instance
let db: SQLiteDatabase | null = null;

/**
 * Initialize the database connection
 */
export const initializeDatabase = async (): Promise<SQLiteDatabase> => {
  if (db) {
    return db;
  }

  db = await openDatabaseAsync(DATABASE_NAME, undefined);

  // Enable foreign key constraints
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Run migrations
  await runMigrations(db);

  return db;
};

/**
 * Get the database instance (must be initialized first)
 */
export const getDatabase = (): SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db!;
};

/**
 * Run database migrations
 */
async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Create accounts table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_sign_in_at INTEGER
    );
  `);

  // Create profiles table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      height_cm INTEGER NOT NULL,
      goal_weight_kg REAL NOT NULL,
      daily_water_goal_l REAL NOT NULL,
      daily_step_goal INTEGER NOT NULL,
      daily_sleep_goal_hours REAL NOT NULL,
      daily_calorie_goal INTEGER NOT NULL,
      wellness_status TEXT,
      gender TEXT,
      primary_health_goal TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create weight history table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS weight_history (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      date TEXT NOT NULL,
      kg REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create water entries table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS water_entries (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      time TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      date_key TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create sleep history table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sleep_history (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      date TEXT NOT NULL,
      hours REAL NOT NULL,
      bedtime TEXT,
      wake_time TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create steps history table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS steps_history (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create diet meals table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS diet_meals (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      meal TEXT NOT NULL,
      calories INTEGER NOT NULL,
      date_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create appointments table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      scheduled_at TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create settings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      theme_preference TEXT,
      notifications_enabled INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better query performance
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON profiles(account_id);
    CREATE INDEX IF NOT EXISTS idx_weight_history_account_id ON weight_history(account_id);
    CREATE INDEX IF NOT EXISTS idx_weight_history_date ON weight_history(date);
    CREATE INDEX IF NOT EXISTS idx_water_entries_account_id ON water_entries(account_id);
    CREATE INDEX IF NOT EXISTS idx_water_entries_date_key ON water_entries(date_key);
    CREATE INDEX IF NOT EXISTS idx_sleep_history_account_id ON sleep_history(account_id);
    CREATE INDEX IF NOT EXISTS idx_sleep_history_date ON sleep_history(date);
    CREATE INDEX IF NOT EXISTS idx_steps_history_account_id ON steps_history(account_id);
    CREATE INDEX IF NOT EXISTS idx_steps_history_date ON steps_history(date);
    CREATE INDEX IF NOT EXISTS idx_diet_meals_account_id ON diet_meals(account_id);
    CREATE INDEX IF NOT EXISTS idx_diet_meals_date_key ON diet_meals(date_key);
    CREATE INDEX IF NOT EXISTS idx_appointments_account_id ON appointments(account_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_settings_account_id ON settings(account_id);
  `);
}