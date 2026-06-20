import { cookies } from "next/headers";

// Shared with proxy.ts (which can't import next/headers on the Edge runtime).
export const LAST_WORKSPACE_COOKIE = "portal_last_workspace";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function setLastVisitedWorkspace(slug: string): Promise<void> {
  const store = await cookies();
  store.set(LAST_WORKSPACE_COOKIE, slug, {
    httpOnly: true,
    sameSite: "lax",
    // eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV is Next.js-provided
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}
