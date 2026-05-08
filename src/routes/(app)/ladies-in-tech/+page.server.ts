import { getPageContent } from '$lib/db/content';
import { LIT_DEFAULT } from '$lib/constants/defaults';

export const load = async () => {
  const page = await getPageContent('/ladies-in-tech', LIT_DEFAULT);
  return { page };
};
