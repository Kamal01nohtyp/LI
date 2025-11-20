import { createClient } from '@supabase/supabase-js';

// These keys will come from your Vercel Environment Variables
// If running locally without env vars, the app will fallback to empty strings and warn the user.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseKey.length > 0;
};