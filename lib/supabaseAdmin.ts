import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY client using the Supabase service role key.
// Never import this file from a "use client" component — the service
// role key bypasses Row Level Security and must stay on the server.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
