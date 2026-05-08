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

  // Handle redirects for old sitemap links
  const redirects: Record<string, string> = {
    '/board-of-directors/': '/team',
    '/elementor-264/': '/services', // Mapping corporate support to services list for now
    '/TEAM/': '/team',
    '/lit-network/': '/ladies-in-tech',
    '/audience/': '/services',
    '/contact/': '/contact',
    '/legal-policies/': '/privacy',
    '/cookie/': '/cookie-policy'
  };

  const path = event.url.pathname;
  if (redirects[path]) {
    return new Response(null, {
      status: 301,
      headers: { location: redirects[path] }
    });
  }

  // Handle trailing slash redirects for non-slash routes
  if (path !== '/' && path.endsWith('/')) {
    const cleanPath = path.slice(0, -1);
    if (redirects[cleanPath]) {
      return new Response(null, {
        status: 301,
        headers: { location: redirects[cleanPath] }
      });
    }
  }

  return svelteKitHandler({ event, resolve, auth, building });
}
