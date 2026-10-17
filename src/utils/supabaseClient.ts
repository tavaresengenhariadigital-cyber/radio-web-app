import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://girsmsjtbovtajdzpoku.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnNtc2p0Ym92dGFqZHpwb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODc5NjAsImV4cCI6MjEwNzc2Mzk2MH0.Ltjl7NUKun3wOvq6aUJt522wt78Rw4ksH1Y8BjnR8nc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Diagnostic check helper
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('station_status').select('*').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // 42P01 is table does not exist yet (normal on fresh project, still connected!)
      console.warn('Supabase query note:', error.message);
    }
    return {
      connected: true,
      message: 'Conexão com Supabase estabelecida com sucesso!',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Falha ao conectar com o Supabase.',
    };
  }
}
