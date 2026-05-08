import { getPageContent } from '$lib/db/pages';
import { SERVICES_DEFAULT } from '$lib/constants/defaults';

export const load = async () => {
  const page = await getPageContent('/services', SERVICES_DEFAULT);
  return { page };
};
