
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wwcoijwnlhxibtlhldpa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y29pandubGh4aWJ0bGhsZHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODAwMjYsImV4cCI6MjA1Njc1NjAyNn0.ZkeYvxjOFFDswaAVtzTZB0EDJppGR7ifWKMhe3cIX7A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Enable realtime subscriptions on the client
supabase.realtime.setAuth(SUPABASE_PUBLISHABLE_KEY);
