import { auth, type User } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { db } from "$lib/db";
import { user as userTable } from "$lib/db/schema";
import { Role } from "$lib/constants";
import { eq } from "drizzle-orm";

const REDIRECTS: Record<string, string> = {
  '/our_team': '/team',
  '/summit-overview': '/events#summit',
  '/ladiesintech': '/ladies-in-tech',
  '/the-certified-digital-transformation-officer-course-first-of-its-kind-in-africa': '/news',
  '/registration': '/membership#join',
  '/summit_live': '/events#summit',
  '/plans/individual-membership': '/membership#cadres',
  '/about/our-team': '/team',
  '/author/cioclub': '/news',
  '/summit_2023': '/gallery',
  '/user-profile': '/profile',
  '/author/tola': '/news',
  '/dpd': '/privacy',
  '/home/ladies-in-tech': '/ladies-in-tech',
  '/breakout-sessions': '/events#summit',
  '/thank-you': '/',
  '/wp-content/uploads/2024/05/Colorful-Illustrated-Weekly-Calendar-2.pdf': '/resources',
  '/tickets-order': '/awards/tickets',
  '/admin/pages/edit': '/admin/pages/edit/home'
};

export async function handle({ event, resolve }) {
  // 1. SEO Redirects for legacy URLs
  const path = event.url.pathname.replace(/\/$/, '');
  const target = REDIRECTS[path || '/'];

  if (target && path !== target) {
    return new Response(null, {
      status: 301,
      headers: { location: target }
    });
  }

  let session;
  try {
    session = await auth.api.getSession({
      headers: event.request.headers,
    });
  } catch (error) {
    console.error("[Hooks Server] Error fetching session:", error);
    session = null;
  }

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user as User;

    // 2. Subscription Expiry Check
    if (
      event.locals.user.subscriptionEndsAt &&
      new Date(event.locals.user.subscriptionEndsAt) < new Date()
    ) {
      const role = event.locals.user.role;
      // Only downgrade if they are currently a paid member (Individual or Corporate)
      if (role === Role.MEMBER_INDIVIDUAL || role === Role.MEMBER_CORPORATE) {
        try {
          await db
            .update(userTable)
            .set({
              role: Role.USER,
              updatedAt: new Date(),
            })
            .where(eq(userTable.id, event.locals.user.id));

          // Reflect the change in locals for the current request
          event.locals.user.role = Role.USER;
          console.log(`User ${event.locals.user.email} downgraded due to expired subscription.`);
        } catch (e) {
          console.error("Failed to downgrade expired subscription:", e);
        }
      }
    }
  } else {
    event.locals.session = undefined;
    event.locals.user = undefined;
  }

  // 3. Admin API Protection
  if (event.url.pathname.startsWith('/api/admin')) {
    if (!event.locals.user || event.locals.user.role !== Role.ADMIN) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return svelteKitHandler({ event, resolve, auth, building });
}
