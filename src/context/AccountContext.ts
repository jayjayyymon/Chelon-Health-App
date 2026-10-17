import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeDatabase } from '@/db/database';
import { getAccountById, createAccount, signInAccount } from '@/db/accountRepository';

type AccountContextType = {
  accountId: string | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database first
    initializeDatabase().then(async () => {
      try {
        // Check for existing account in database
        // For now, we'll check if there's any account in the database
        // In a real app, you might want to track the last used account
        const db = await initializeDatabase();
        const accounts = await db.getAllAsync<{ id: string }>('SELECT id FROM accounts LIMIT 1');
        if (accounts.length > 0) {
          setAccountId(accounts[0].id);
        }
      } catch (error) {
        console.error('Failed to load account from database:', error);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // Account management functions
  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      const db = await initializeDatabase();
      const result = await createAccount({ email, password });
      setAccountId(result.id);
      return true;
    } catch (error) {
      console.error('Sign up failed:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const db = await initializeDatabase();
      const result = await signInAccount(email, password);
      setAccountId(result.id);
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Update last sign-in time for the account before signing out
      if (accountId) {
        const db = await initializeDatabase();
        await db.runAsync(
          'UPDATE accounts SET last_sign_in_at = ? WHERE id = ?',
          [Date.now(), accountId]
        );
      }
      setAccountId(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return React.createElement(
    AccountContext.Provider,
    {
      value: {
        accountId,
        loading,
        signUp,
        signIn,
        signOut
      }
    },
    children
  );
};