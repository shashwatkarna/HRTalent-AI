import { createClient } from "@supabase/supabase-js";

// This client uses the Service Role Key. 
// It MUST ONLY be used on the server, and ONLY for secure admin actions.
// It bypasses Row Level Security (RLS) entirely.
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Admin Environment Variables");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false, // Don't persist this session, it's a server admin action
      },
    }
  );
}
