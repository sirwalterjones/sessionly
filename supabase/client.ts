import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/utils/env-mapping";

export const createClient = () => {
  const { supabaseUrl, supabaseAnonToken } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonToken);
};
