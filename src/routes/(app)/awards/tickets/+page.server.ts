import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  redirect(307, 'https://rsvp.app-wt.com.ng/the-cio-c-suite-awards-africa-2026');
};
