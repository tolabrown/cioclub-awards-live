import { APIError, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/db/drizzle';
import { schema } from '$lib/db/schema';
import { createAuthMiddleware, openAPI, admin as adminPlugin, customSession, magicLink } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';
import { Role } from '$lib/constants';
import { roles, ac } from '$lib/db/permissions';
import { getAccountByUserId } from '$lib/db/account';

const VALID_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com'];
const normalizeName = (name: string) => {
  return name
    .trim()
    .replace(/[^a-zA-z\s'-]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [
    openAPI(),
    adminPlugin({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN],
      ac,
      roles
    }),
    customSession(async ({ user, session }) => {
      const userAccount = await getAccountByUserId(user.id);
      return { account: userAccount.data, user, session };
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { EmailService } = await import('$lib/server/emailservice');
        await EmailService.sendMagicLink(email, url);
      }
    })
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const { EmailService } = await import('$lib/server/emailservice');
      await EmailService.sendPasswordReset(user.email, url);
      console.log("reset password email sent to:", user.email);
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = ctx.body?.email as string;
        const domain = email.split("@")[1];
        if (!VALID_DOMAINS.includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid domain: " + domain + " is not permitted on this platform",
          });
        }
        const name = normalizeName(ctx.body.name);
        return { context: { ...ctx, body: { ...ctx.body, name } } };
      }
      if (ctx.path === '/sign-in/magic-link') {
        const name = normalizeName(ctx.body.name);
        return { context: { ...ctx, body: { ...ctx.body, name } } };
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const ctxAny = ctx as any;
        const body = ctx.body as any;
        const returned = ctxAny.returned;

        const user = returned?.user || (returned?.email ? returned : null) || {
          email: body?.email,
          name: body?.name
        };

        if (user && user.email && user.name) {
          try {
            const { EmailService } = await import('$lib/server/emailservice');
            await EmailService.sendWelcomeEmail(user.email, user.name);
          } catch (e) {
            console.error("[Auth Hook] Failed to send welcome email:", e);
          }
        }
      }
    })
  },
  session: { expiresIn: 60 * 60 * 24 * 30 }
});

export type ErrorCodes = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';
export type User = typeof auth.$Infer.Session.user & {
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};
