import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from Expo constants
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration not found. Please set supabaseUrl and supabaseAnonKey in app.json extra.');
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type for Supabase user
export type SupabaseUser = {
  id: string;
  email: string | null;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  role: string;
  aud: string;
  confirmation_sent_at: string | null;
  recovery_sent_at: string | null;
  email_change: string | null;
  email_change_token_new: string | null;
  email_change_expires_at: string | null;
};