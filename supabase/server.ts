import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/utils/env-mapping";

export const createClient = async () => {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseAnonToken } = getSupabaseConfig();

  return createServerClient(supabaseUrl, supabaseAnonToken, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({
          name,
          value,
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
};
