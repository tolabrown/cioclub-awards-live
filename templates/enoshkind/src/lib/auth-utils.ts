import { browser } from "$app/environment";
import { signIn } from "$lib/auth-client";
import { Constants } from "$lib/constants";
import { toast } from "svelte-sonner";

// Get redirect URL from query params or default
export const getRedirectUrl = (): string => {
  if (!browser) return Constants.AFTERAUTH;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('redirectTo') || urlParams.get('redirect') || Constants.AFTERAUTH;

  // Validate redirect URL to prevent open redirect attacks
  try {
    const url = new URL(redirectTo, window.location.origin);
    // Only allow same-origin redirects
    if (url.origin === window.location.origin) {
      return redirectTo;
    }
  } catch {
    // Invalid URL, fall back to default
  }

  return Constants.AFTERAUTH;
};

export const handleSocialSignin = async (provider: 'apple' | 'google', callbackURL: string) => {
  await signIn.social({
    provider,
    callbackURL,
  }, {
    onSuccess: () => {
      toast.success("Success", { description: "Successfully signed in" })
    },
    onError: (ctx) => {
      toast.error("Error", { description: ctx.error.message })
    }
  })
};
