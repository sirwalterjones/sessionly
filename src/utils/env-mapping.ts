// This file helps map environment variables to more secure names for Vercel

export const getSupabaseConfig = () => {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonToken: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    supabaseServiceToken: process.env.SUPABASE_SERVICE_KEY || "",
  };
};
