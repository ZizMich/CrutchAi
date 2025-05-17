/**
 * Supabase client singleton for authentication.
 * Creates and exports a configured Supabase client instance for use throughout the application.
 * 
 * @module supabaseClient
 * @todo Add tests for both real and mock auth flows.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Type definition for environment variables
interface EnvVars {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

// Get environment variables
const env = import.meta.env as EnvVars;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables."
  );
}

/**
 * Configured Supabase client instance
 * @type {SupabaseClient}
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Add error event listener for debugging in development
if (import.meta.env.DEV) {
  // Log any auth state changes in development
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Supabase auth event: ${event}`, session);
  });
}

/**
 * The Supabase client instance (or mock for development)
 */
export default supabase;
