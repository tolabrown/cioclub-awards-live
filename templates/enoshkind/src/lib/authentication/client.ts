import { browser } from "$app/environment";
import { signIn } from "$lib/auth-client";
import { Constants } from "$lib/constants";
import type { iResult } from "$lib/interface";
import type { Account } from "better-auth";
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
      toast.success("Success Alert", { description: "Successful Sign in" })
    },
    onError: (ctx) => {
      toast.error("Error Alert", { description: ctx.error.message })
    }
  })
};

export const updateProfile = async (formData: FormData, id: string) => {
  try {
    const options: RequestInit = {
      method: 'PATCH',
      body: formData,
    }
    const url = `/api/users/${id}`
    const response = await fetch(url, options)
    const { message, status } = await response.json() as iResult

    if (status === 'error') {
      toast.error("Error Alert", { description: message })
      return { status, message }
    }
    toast.success("Success Alert", { description: "Profile updated successfully" })
    location.reload()
  } catch (error: any) {
    toast.error("Error Alert", { description: error.message })
  }
}

export const getAccount = async (userId: string) => {
  try {
    const url = `/api/accounts/${userId}`
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    }
    const response = await fetch(url, options)
    const { message, status, data } = await response.json() as iResult
    if (status === 'error') {
      throw new Error(message)
    }
    return data as Account
  } catch (error: any) {
    return null
  }
}
