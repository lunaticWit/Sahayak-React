/**
 * Supabase client and storage configuration
 * Provides connectivity to Supabase PostgreSQL or falls back seamlessly to local mock store.
 */

export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl?.includes('your-project') &&
    !supabaseUrl?.includes('demo-sahayak')
  );
};

export const getSupabaseConfig = () => {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://demo-sahayak.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key',
    isLive: isSupabaseConfigured(),
  };
};
