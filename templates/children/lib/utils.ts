import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Calculate age group based on date of birth
 * @param dateOfBirth - Date of birth
 * @returns Age group name or null if date is invalid
 */
export function calculateAgeGroup(dateOfBirth: Date | null | undefined): string | null {
	if (!dateOfBirth) return null;

	const dob = new Date(dateOfBirth);
	const today = new Date();

	// Calculate age
	let age = today.getFullYear() - dob.getFullYear();
	const monthDiff = today.getMonth() - dob.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age--;
	}

	// Age group mapping
	const ageGroupMapping = [
		{ name: "Nursery", min: 0, max: 2 },
		{ name: "Toddlers", min: 3, max: 4 },
		{ name: "Beginners", min: 5, max: 6 },
		{ name: "Primary", min: 7, max: 9 },
		{ name: "Juniors", min: 10, max: 12 },
		{ name: "Teenagers", min: 13, max: 17 },
		{ name: "Young Adults", min: 18, max: 24 },
		{ name: "Adults", min: 25, max: 999 },
	];

	const group = ageGroupMapping.find((g) => age >= g.min && age <= g.max);
	return group ? group.name : null;
}
