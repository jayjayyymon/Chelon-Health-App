import * as Crypto from 'expo-crypto';

/**
 * Generate a random salt
 */
export const generateSalt = async (): Promise<string> => {
  const saltBytes = await Crypto.getRandomBytes(16);
  return Array.from(saltBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Hash a password with salt using SHA-256
 * Note: For production, consider using bcrypt or PBKDF2 with more iterations
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  // Combine password and salt
  const passwordSalt = password + salt;

  // Encode as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(passwordSalt);

  // Hash using SHA-256
  const hashBuffer = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    passwordSalt
  );

  return hashBuffer;
};

/**
 * Verify a password against a hash and salt
 */
export const verifyPassword = async (
  password: string,
  hash: string,
  salt: string
): Promise<boolean> => {
  const hashedPassword = await hashPassword(password, salt);
  return hashedPassword === hash;
}