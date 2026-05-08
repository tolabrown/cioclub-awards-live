import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { organization, organizationMember, user } from '$lib/db/schema';
import { Role } from '$lib/constants';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	const currentUser = locals.user;
	if (!currentUser) {
		throw redirect(302, '/login');
	}

	// Check if user has permission (ADMIN or MEMBER_CORPORATE)
	if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.MEMBER_CORPORATE) {
		throw error(403, 'Unauthorized');
	}

	// If user already has an organization, redirect to it
	if (currentUser.organizationId) {
		throw redirect(302, `/corporate/${currentUser.organizationId}`);
	}

	return {
		user: currentUser
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const currentUser = locals.user;
		if (!currentUser) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (!name || name.length < 2) {
			return fail(400, { message: 'Organization name must be at least 2 characters.' });
		}

		try {
			// Atomic creation using a transaction
			const result = await db.transaction(async (tx) => {
				// 1. Create organization
				const [newOrg] = await tx.insert(organization).values({
					name,
					adminId: currentUser.id,
				}).returning();

				// 2. Add creator as the first member (admin)
				await tx.insert(organizationMember).values({
					organizationId: newOrg.id,
					userId: currentUser.id,
					email: currentUser.email,
					role: 'admin',
					status: 'active'
				});

				// 3. Link user to organization
				await tx.update(user)
					.set({ organizationId: newOrg.id })
					.where(eq(user.id, currentUser.id));

				return newOrg;
			});

			return { success: true, orgId: result.id };
		} catch (err) {
			console.error('Error creating organization:', err);
			return fail(500, { message: 'Failed to create organization. Please try again.' });
		}
	}
};
