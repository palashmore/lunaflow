import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from environment or fallback storage
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Check if credentials exist in localStorage if user configured them dynamically
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('lunaflow_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('lunaflow_supabase_key') : null;

export const SUPABASE_URL = (envUrl || localUrl || '').trim();
export const SUPABASE_ANON_KEY = (envKey || localKey || '').trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http') && 
  SUPABASE_ANON_KEY.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Configure or update Supabase credentials dynamically
 */
export function setSupabaseConfig(url: string, key: string): void {
  if (url && key) {
    localStorage.setItem('lunaflow_supabase_url', url.trim());
    localStorage.setItem('lunaflow_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem('lunaflow_supabase_url');
  localStorage.removeItem('lunaflow_supabase_key');
  window.location.reload();
}
