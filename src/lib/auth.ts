import { APIError, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/db/drizzle';
import { schema } from '$lib/db/schema';
import { createAuthMiddleware, openAPI, admin as adminPlugin, customSession, magicLink } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';
import { Role } from '$lib/constants';
import { roles, ac } from '$lib/db/permissions';
import { sendEmailAction } from '$lib/authentication/server';
import { getAccountByUserId } from '$lib/db/account';

const VALID_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com'];
const normalizeName = (name: string) => {
  return name
    .trim()
    .replace(/[^a-zA-z\s'-]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user"
      },
      banned: {
        type: "boolean",
        defaultValue: false
      },
      banReason: {
        type: "string",
        required: false
      },
      banExpires: {
        type: "date",
        required: false
      },
      subscriptionEndsAt: {
        type: "date",
        required: false
      },
      organizationId: {
        type: "string",
        required: false
      },
      contactDetails: {
        type: "string",
        required: false
      },
      previousRole: {
        type: "string",
        required: false
      },
      sector: {
        type: "string",
        required: false
      },
      currentLocation: {
        type: "string",
        required: false
      },
      areasOfExpertise: {
        type: "string",
        required: false
      },
      interests: {
        type: "string",
        required: false
      },
      collaborationGoals: {
        type: "string",
        required: false
      }
    }
  },
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

      // Log Logout
      if (ctx.path === "/sign-out" && ctx.request) {
         const session = await auth.api.getSession({ headers: ctx.request.headers });
         if (session?.user) {
            const { logActivity } = await import('$lib/server/activity-log');
            await logActivity(null, {
               userId: session.user.id,
               action: "User signed out",
               operation: "AUTH",
               metadata: { path: ctx.path }
            });
         }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      console.log(`[Auth Hook] After hook triggered for path: ${ctx.path}`);
      const { logActivity } = await import('$lib/server/activity-log');

      // Log Sign-In
      if (ctx.path === "/sign-in/email" || ctx.path === "/sign-in/social") {
         const ctxAny = ctx as any;
         const user = ctxAny.returned?.user;
         if (user) {
            await logActivity(null, {
               userId: user.id,
               action: `User signed in via ${ctx.path.split('/').pop()}`,
               operation: "AUTH",
               metadata: { path: ctx.path }
            });
         }
      }

      if (ctx.path === "/sign-up/email") {
        const ctxAny = ctx as any;
        const body = ctx.body as any;
        const returned = ctxAny.returned;

        // Try to get user from response (returned), then fallback to request body if needed
        const user = returned?.user || (returned?.email ? returned : null) || {
          email: body?.email,
          name: body?.name
        };

        if (user && user.email && user.name) {
          console.log(`[Auth Hook] Attempting to send welcome email to: ${user.email}`);
          
          if (user.id) {
            await logActivity(null, {
               userId: user.id,
               action: "User signed up",
               operation: "AUTH",
               metadata: { email: user.email }
            });
          }

          try {
            const { EmailService } = await import('$lib/server/emailservice');
            await EmailService.sendWelcomeEmail(user.email, user.name);
            console.log("[Auth Hook] Welcome email dispatch successful for:", user.email);

            // Handle Organization Invitation
            const { db } = await import('$lib/db');
            const { organizationMember, user: userTable } = await import('$lib/db/schema');
            const { eq, sql, and } = await import('drizzle-orm');
            const { Role } = await import('$lib/constants');

            const [invitation] = await db.select().from(organizationMember)
              .where(and(
                eq(sql`lower(${organizationMember.email})`, user.email.toLowerCase()),
                eq(organizationMember.status, 'pending')
              ));

            if (invitation) {
              console.log(`[Auth Hook] Found pending invitation for ${user.email} to join organization ${invitation.organizationId}`);
              
              // 1. Link user to organization
              const [dbUser] = await db.select().from(userTable).where(eq(userTable.email, user.email));
              if (dbUser) {
                await db.update(userTable)
                  .set({ 
                    organizationId: invitation.organizationId,
                    role: Role.MEMBER_CORPORATE,
                    updatedAt: new Date()
                  })
                  .where(eq(userTable.id, dbUser.id));

                // 2. Activate membership record
                await db.update(organizationMember)
                  .set({
                    userId: dbUser.id,
                    status: 'active',
                    updatedAt: new Date()
                  })
                  .where(eq(organizationMember.id, invitation.id));
                
                console.log(`[Auth Hook] Successfully joined ${user.email} to organization ${invitation.organizationId}`);
                
                await logActivity(null, {
                   userId: dbUser.id,
                   action: `Joined organization: ${invitation.organizationId}`,
                   operation: "UPDATE",
                   entityType: "organization",
                   entityId: invitation.organizationId
                });
              }
            }
          } catch (e) {
            console.error("[Auth Hook] Failed in post-signup logic:", e);
          }
        } else {
          console.warn("[Auth Hook] Missing user details (email/name) for welcome email. User context:", JSON.stringify(user || {}));
        }
      }

      if (ctx.path === "/verify-email") {
        const ctxAny = ctx as any;
        const user = ctxAny.returned?.user;
        if (user) {
          await logActivity(null, {
            userId: user.id,
            action: "Email verified successfully",
            operation: "UPDATE",
            entityType: "user",
            metadata: { email: user.email }
          });
        }
      }

      if (ctx.path === "/reset-password") {
        const ctxAny = ctx as any;
        const user = ctxAny.returned?.user;
        if (user) {
          await logActivity(null, {
            userId: user.id,
            action: "Password reset successful",
            operation: "UPDATE",
            entityType: "user",
            metadata: { email: user.email }
          });
        }
      }

      if (ctx.path.startsWith("/admin/") && ctx.request) {
        const ctxAny = ctx as any;
        const session = await auth.api.getSession({ headers: ctx.request.headers });
        if (session?.user) {
          await logActivity(null, {
            userId: session.user.id,
            action: `Admin Action: ${ctx.path.split('/').pop()}`,
            operation: "UPDATE",
            entityType: "admin_management",
            metadata: { 
              path: ctx.path,
              targetUserId: ctx.body?.userId || ctx.body?.id,
              data: ctx.body
            }
          });
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
  subscriptionEndsAt?: Date | null;
  organizationId?: string | null;
  contactDetails?: string | null;
  previousRole?: string | null;
  sector?: string | null;
  currentLocation?: string | null;
  areasOfExpertise?: string | null;
  interests?: string | null;
  collaborationGoals?: string | null;
};
