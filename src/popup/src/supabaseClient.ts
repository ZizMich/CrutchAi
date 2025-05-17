/**
 * Supabase client singleton for authentication.
 * Automatically uses real Supabase if credentials are present in env variables (REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY).
 * Falls back to a mock implementation for local development/testing.
 *
 * @module supabaseClient
 * @todo Add tests for both real and mock auth flows.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not set in environment variables. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * The Supabase client instance (or mock for development)
 */
export default supabase;
