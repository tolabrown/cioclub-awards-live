/**
 * Maps Better-Auth error messages/codes to user-friendly descriptions.
 * Falls back to the raw message if no mapping is found.
 */

const ERROR_MAP: Record<string, { title: string; description: string }> = {
  // Sign-up errors
  'User already exists': {
    title: 'Account Already Exists',
    description: 'An account with this email already exists. Please sign in instead, or use a different email.'
  },
  'user already exists': {
    title: 'Account Already Exists',
    description: 'An account with this email already exists. Please sign in instead, or use a different email.'
  },

  // Sign-in errors
  'Invalid email or password': {
    title: 'Sign-In Failed',
    description: 'The email or password you entered is incorrect. Please check your credentials and try again.'
  },
  'invalid email or password': {
    title: 'Sign-In Failed',
    description: 'The email or password you entered is incorrect. Please check your credentials and try again.'
  },
  'Invalid credentials': {
    title: 'Sign-In Failed',
    description: 'The email or password you entered is incorrect. Please double-check and try again.'
  },

  // Email verification errors
  'Email is not verified': {
    title: 'Email Not Verified',
    description: 'Please verify your email address before signing in. Check your inbox for a verification link.'
  },

  // Rate limiting
  'Too many requests': {
    title: 'Too Many Attempts',
    description: 'You\'ve made too many attempts. Please wait a few minutes and try again.'
  },

  // Account banned
  'User is banned': {
    title: 'Account Suspended',
    description: 'Your account has been suspended. Please contact support for assistance.'
  },

  // Password reset
  'INVALID_TOKEN': {
    title: 'Invalid or Expired Link',
    description: 'This reset link is invalid or has expired. Please request a new password reset.'
  },
  'Token is invalid or expired': {
    title: 'Link Expired',
    description: 'This password reset link has expired. Please request a new one.'
  },

  // Social auth
  'Failed to get user info': {
    title: 'Sign-In Failed',
    description: 'We couldn\'t retrieve your account info from Google. Please try again.'
  },

  // Domain restriction (custom from your middleware)
  'Invalid domain': {
    title: 'Email Domain Not Allowed',
    description: 'This email domain is not permitted on this platform. Please use a supported email provider (Gmail, Yahoo, or Outlook).'
  },

  // Network
  'Failed to fetch': {
    title: 'Connection Error',
    description: 'Unable to reach the server. Please check your internet connection and try again.'
  },
};

export function getAuthError(error: { message?: string; code?: string; status?: number }): { title: string; description: string } {
  const message = error.message || '';
  const code = error.code || '';

  // Try exact match on message
  if (ERROR_MAP[message]) return ERROR_MAP[message];

  // Try exact match on code
  if (ERROR_MAP[code]) return ERROR_MAP[code];

  // Try partial match on message (for messages like "Invalid domain: xyz.com is not permitted...")
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      // For domain errors, include the actual message as it has the specific domain
      if (key === 'Invalid domain') {
        return { title: value.title, description: message };
      }
      return value;
    }
  }

  // Fallback: use the raw message but with a better title
  return {
    title: 'Something Went Wrong',
    description: message || 'An unexpected error occurred. Please try again or contact support.'
  };
}

export function getAuthSuccessMessage(action: 'sign-in' | 'sign-up' | 'reset-request' | 'reset-complete' | 'social-sign-in'): { title: string; description: string } {
  switch (action) {
    case 'sign-in':
      return { title: 'Welcome Back!', description: 'You have been signed in successfully.' };
    case 'sign-up':
      return { title: 'Account Created!', description: 'Welcome aboard! Your account is ready.' };
    case 'reset-request':
      return { title: 'Reset Link Sent', description: 'Check your inbox for a password reset link.' };
    case 'reset-complete':
      return { title: 'Password Updated', description: 'Your password has been reset successfully. Please sign in.' };
    case 'social-sign-in':
      return { title: 'Welcome!', description: 'You have been signed in with Google.' };
  }
}
