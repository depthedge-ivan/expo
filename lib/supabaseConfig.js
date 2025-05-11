import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://lcvuramjfxxxzmcivocd.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdnVyYW1qZnh4eHptY2l2b2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTYwMTQsImV4cCI6MjA1ODE5MjAxNH0.clG7eNWPfwbAyb9rwpAZXJxzfiTEw1qjVUQ3ykl9ltM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    fetch: fetch,
  },
  realtime: {
    enabled: false
  }
});
