// ── Supabase Configuration ──
// Replace these values with your Supabase project credentials
const SUPABASE_URL = "https://maqsgxajihwveaibiulq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcXNneGFqaWh3dmVhaWJpdWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzUwNjAsImV4cCI6MjA4ODExMTA2MH0.xj91vqlmaC9Jj-e7TtEEI1XSUEnfshRJDi_JW9chrEM";

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);
