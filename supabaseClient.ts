import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These keys will come from your Vercel Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseKey.length > 0;
};

// Prevent crash if keys are missing (returns an empty object cast as client)
// The App component checks isSupabaseConfigured() before using this, so it's safe.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey)
  : ({} as SupabaseClient);