import { APIError, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '$lib/db/drizzle'
import { schema } from '$lib/db/schema'
import { createAuthMiddleware, openAPI, admin as adminPlugin, customSession, magicLink } from 'better-auth/plugins'
import { env } from '$env/dynamic/private'
import { Role } from '$lib/constants'
import { roles, ac } from '$lib/db/permissions'

const VALID_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
const normalizeName = (name: string) => {
  return name
    .trim()
    .replace(/[^a-zA-z\s'-]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema
  }),
  user: {
    additionalFields: {
      bio: {
        type: 'string',
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
      return {
        user,
        session
      };
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // TODO: Implement email sending with Resend
        console.log("Magic link for:", email, "URL:", url)
      }
    })
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending with Resend
      console.log("Reset password email for:", user.email, "URL:", url)
    }
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || ''
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = ctx.body?.email as string
        const domain = email.split("@")[1]

        if (!VALID_DOMAINS.includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: `Invalid domain: ${domain} is not permitted on this platform`,
          });
        }

        const name = normalizeName(ctx.body.name)
        return {
          context: { ...ctx, body: { ...ctx.body, name } }
        }
      }

      if (ctx.path === '/sign-in/magic-link') {
        const name = normalizeName(ctx.body.name)
        return {
          context: { ...ctx, body: { ...ctx.body, name } }
        }
      }
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  }
})

export type ErrorCodes = keyof typeof auth.$ERROR_CODES | 'UNKNOWN'

export type User = typeof auth.$Infer.Session.user
