import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouavgvrqwlvlrtkwyspm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YXZndnJxd2x2bHJ0a3d5c3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDU4OTEsImV4cCI6MjA5MjE4MTg5MX0.d7WL7vT2gX355hpGJI0jn_gzy9ys3cKETweiixKAmAs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})