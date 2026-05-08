import { MEMBERSHIP_DEFAULT } from "../constants/defaults";

/**
 * Calculates how many years of subscription a payment amount covers for a given tier.
 * @param tierName - The id or name of the membership tier
 * @param amountInKobo - The payment amount in the smallest currency unit (kobo)
 * @returns number of years (rounded down, minimum 1)
 */
export function calculateSubscriptionYearsFromKobo(tierName: string, amountInKobo: number): number {
  const tier = MEMBERSHIP_DEFAULT.tiers.find(
    (t) => t.name.toLowerCase() === tierName.toLowerCase() || t.id === tierName.toLowerCase()
  );

  if (!tier || tier.amount <= 0) return 1;

  // Convert amount from kobo to Naira (base unit)
  const amountInNaira = amountInKobo / 100;

  // Calculate years based on multiples of the base amount
  const years = Math.floor(amountInNaira / tier.amount);
  return years > 0 ? years : 1;
}

/**
 * Calculates the new expiration date based on current status.
 * If current expiry is in the future, it adds time to it.
 * Otherwise, it adds time starting from now.
 * @param currentExpiry - Current subscription end date
 * @param years - Number of years to add
 */
export function calculateExtendedExpiry(currentExpiry: Date | null | undefined, years: number): Date {
  const now = new Date();
  const baseDate = currentExpiry && currentExpiry > now ? new Date(currentExpiry) : now;
  
  const newExpiry = new Date(baseDate);
  newExpiry.setFullYear(newExpiry.getFullYear() + years);
  
  return newExpiry;
}

/**
 * Calculates days remaining until expiration.
 * @param expiryDate - The date the subscription expires
 */
export function getDaysRemaining(expiryDate: Date | string | null | undefined): number {
  if (!expiryDate) return 0;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
