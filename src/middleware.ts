import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are not available, return early
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase URL or Anon Key not available in environment variables",
    );
    return res;
  }

  try {
    // Create the Supabase client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // If the cookie is being set, update the response
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // If the cookie is being deleted, update the response
          req.cookies.delete(name);
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    });

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();
  } catch (error) {
    console.error("Error in middleware:", error);
    // Don't modify the response if there's an error, just return it
  }

  return res;
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
