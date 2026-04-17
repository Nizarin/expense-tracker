import { auth } from "@/auth";

// proxy.ts runs on Node.js runtime in Next.js 16
// Import from auth.ts directly — no need for Edge-safe split anymore
export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
