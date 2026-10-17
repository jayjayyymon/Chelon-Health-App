import { getDatabase } from './database';
import { generateSalt, hashPassword, verifyPassword } from '@/utils/passwordUtils';
import { randomUUID } from 'expo-crypto';

export type Account = {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: number;
  last_sign_in_at?: number;
};

export type CreateAccountInput = {
  email: string;
  password: string;
};

export type AccountResponse = Omit<Account, 'password_hash' | 'salt'>;

/**
 * Create a new account
 */
export const createAccount = async (
  input: CreateAccountInput
): Promise<AccountResponse> => {
  const db = getDatabase();

  // Check if account already exists
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM accounts WHERE email = ?',
    [input.email.toLowerCase().trim()]
  );

  if (existing) {
    throw new Error('Account with this email already exists');
  }

  // Generate salt and hash password
  const salt = await generateSalt();
  const passwordHash = await hashPassword(input.password, salt);

  // Create account
  const id = randomUUID();
  const timestamp = Date.now();

  await db.runAsync(
    `INSERT INTO accounts (id, email, password_hash, salt, created_at, last_sign_in_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.email.toLowerCase().trim(), passwordHash, salt, timestamp, timestamp]
  );

  // Return account without sensitive data
  return {
    id,
    email: input.email.toLowerCase().trim(),
    created_at: timestamp,
    last_sign_in_at: timestamp
  };
};

/**
 * Sign in an account
 */
export const signInAccount = async (
  email: string,
  password: string
): Promise<AccountResponse> => {
  const db = getDatabase();

  const account = await db.getFirstAsync<Account>(
    'SELECT * FROM accounts WHERE email = ?',
    [email.toLowerCase().trim()]
  );

  if (!account) {
    throw new Error('Invalid email or password');
  }

  const isValid = await verifyPassword(password, account.password_hash, account.salt);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last sign-in time
  const lastSignInAt = Date.now();
  await db.runAsync(
    'UPDATE accounts SET last_sign_in_at = ? WHERE id = ?',
    [lastSignInAt, account.id]
  );

  // Return account without sensitive data
  return {
    id: account.id,
    email: account.email,
    created_at: account.created_at,
    last_sign_in_at: lastSignInAt
  };
};

/**
 * Get account by ID
 */
export const getAccountById = async (id: string): Promise<AccountResponse | null> => {
  const db = getDatabase();

  const account = await db.getFirstAsync<Account>(
    'SELECT * FROM accounts WHERE id = ?',
    [id]
  );

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    email: account.email,
    created_at: account.created_at,
    last_sign_in_at: account.last_sign_in_at
  };
};

/**
 * Update last sign-in time for an account
 */
export const updateLastSignIn = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE accounts SET last_sign_in_at = ? WHERE id = ?',
    [Date.now(), id]
  );
};