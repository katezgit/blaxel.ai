import { NextResponse, type NextRequest } from "next/server";
import { LAST_WORKSPACE_COOKIE } from "@/lib/workspace/last-visited";

const SESSION_COOKIE = "portal_session";

// Two narrow concerns, both intentionally outside the React tree so the redirect
// emits as a real HTTP 307 (not the meta-refresh that Server Component redirect()
// produces in a streaming context — see Next.js redirect() docs).
//
// 1. /login, /register — bounce signed-in users back into the app.
// 2. / — bounce to the user's last-visited workspace's Sandboxes page. The
//    workspace gate at [workspaceSlugOrId]/layout.tsx writes the cookie only
//    after a successful existence + permission audit, so the slug here is
//    trusted. If the cookie is missing (cleared, expired, or first visit before
//    the workspace layout ran), fall through to /login — the login Server
//    Action seeds the cookie on success.
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const lastWorkspace = request.cookies.get(LAST_WORKSPACE_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    if (!hasSession || !lastWorkspace) {
      return redirectTo(request, "/login");
    }
    return redirectTo(request, `/${lastWorkspace}/sandboxes`);
  }

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  // Only bounce away from auth routes when both cookies are intact — otherwise
  // / can't redirect into the app, and we need the auth route to render so the
  // login action can re-seed the workspace cookie.
  if (isAuthRoute && hasSession && lastWorkspace) {
    return redirectTo(request, "/");
  }

  return NextResponse.next();
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/login", "/register"],
};
