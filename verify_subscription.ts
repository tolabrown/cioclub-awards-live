import { calculateSubscriptionYearsFromKobo, getDaysRemaining, calculateExtendedExpiry } from './src/lib/utils/subscription';
import { MEMBERSHIP_DEFAULT } from './src/lib/constants/defaults';

async function runTests() {
  console.log('--- Subscription Logic Verification ---');

  // Test 1: Student Tier (20,000 Naira / 2,000,000 kobo)
  const studentKobo = 2000000;
  const studentYears = calculateSubscriptionYearsFromKobo('student', studentKobo);
  console.log(`Student (20k Naira): ${studentKobo} kobo -> ${studentYears} year(s). Expected: 1`);
  if (studentYears !== 1) throw new Error('Student calculation failed');

  // Test 2: Executive Tier (200,000 Naira / 20,000,000 kobo)
  const execKobo = 20000000;
  const execYears = calculateSubscriptionYearsFromKobo('executive', execKobo);
  console.log(`Executive (200k Naira): ${execKobo} kobo -> ${execYears} year(s). Expected: 1`);
  if (execYears !== 1) throw new Error('Executive calculation failed');

  // Test 3: Multi-year (e.g. 2 years Student)
  const multiYearKobo = 4000000;
  const multiYears = calculateSubscriptionYearsFromKobo('student', multiYearKobo);
  console.log(`Student (40k Naira): ${multiYearKobo} kobo -> ${multiYears} year(s). Expected: 2`);
  if (multiYears !== 2) throw new Error('Multi-year calculation failed');

  // Test 4: getDaysRemaining
  const oneYearFromNow = new Date();
  oneYearFromNow.setDate(oneYearFromNow.getDate() + 365);
  const daysLeft = getDaysRemaining(oneYearFromNow);
  console.log(`365 days from now -> ${daysLeft} days remaining. Expected: 365`);
  if (daysLeft !== 365) throw new Error('Days remaining calculation failed');

  // Test 5: calculateExtendedExpiry
  const currentExpiry = new Date('2025-01-01');
  const extended = calculateExtendedExpiry(currentExpiry, 1);
  console.log(`Extended from 2025-01-01 by 1 year -> ${extended.toISOString().split('T')[0]}. Expected: 2026-01-01`);
  if (extended.getFullYear() !== 2026) throw new Error('Extended expiry calculation failed');

  console.log('\n✅ All subscription logic tests passed!');
}

runTests().catch(err => {
  console.error('\n❌ Verification failed:', err.message);
  process.exit(1);
});
