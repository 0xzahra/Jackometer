import { createClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(url && key && url.startsWith("http"));

const dummySupabase = {
  from: () => dummySupabase,
  select: () => dummySupabase,
  insert: () => dummySupabase,
  upsert: () => dummySupabase,
  eq: () => dummySupabase,
  maybeSingle: async () => ({ data: null, error: null }),
  then: (resolve: any) => resolve({ data: null, error: null }),
};

export const supabase = isSupabaseConfigured 
  ? createClient(url, key) 
  : (dummySupabase as any);
