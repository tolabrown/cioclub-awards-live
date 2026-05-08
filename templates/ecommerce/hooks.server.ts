import { auth, type User } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

export async function handle({ event, resolve }) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user as User;
  } else {
    event.locals.session = undefined;
    event.locals.user = undefined;
  }

  // Manage guest cart session
  let cartSessionId = event.cookies.get("cart_session_id");
  if (!cartSessionId) {
    cartSessionId = crypto.randomUUID();
    event.cookies.set("cart_session_id", cartSessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
  event.locals.cartSessionId = cartSessionId;

  const result = await svelteKitHandler({ event, resolve, auth, building });

  // Merge cart if user just logged in
  if (session && cartSessionId) {
    // This could also be done in the auth callback, but here is a simple place to ensure it
    // We might want to clear the cookie afterwards or just leave it
  }

  return result;
}
