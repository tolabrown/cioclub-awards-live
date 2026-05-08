import { createAuthClient } from "better-auth/svelte"; // make sure to import from better-auth/svelte
import { env } from "$env/dynamic/public";
import { adminClient as _admin, customSessionClient, inferAdditionalFields, magicLinkClient } from 'better-auth/client/plugins'
import { ac, roles } from "$lib/db/permissions";
import type { auth } from "./auth";

const authClient = createAuthClient({
  // you can pass client configuration here
  baseURL: env.PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    _admin({ ac, roles }),
    customSessionClient<typeof auth>(),
    magicLinkClient()
  ]
});

export const { signUp, signOut, signIn, useSession, admin, sendVerificationEmail, resetPassword, changePassword, forgetPassword } = authClient
