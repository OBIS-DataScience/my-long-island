import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware — runs before every request.
 *
 * Its job here is to refresh the Supabase auth session automatically.
 * Without this, users would get randomly logged out as their session
 * tokens expire.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|manifest.json|sw.js).*)",
  ],
};
