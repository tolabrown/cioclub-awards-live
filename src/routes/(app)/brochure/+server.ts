import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	// Redirects directly to the live CIO & C-Suite 2026 Conference Brochure PDF
	throw redirect(302, 'https://files.catbox.moe/xj1iro.pdf');
};
