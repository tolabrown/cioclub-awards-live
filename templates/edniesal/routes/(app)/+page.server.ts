import { getPageContent } from '$lib/db/pages';
import { HOME_DEFAULT, SERVICES_DEFAULT, ABOUT_DEFAULT } from '$lib/constants/defaults';
import { getAllServices, getTeamMembers } from '$lib/db/site';

export const load = async () => {
  const page = await getPageContent('/', HOME_DEFAULT);
  const services = await getAllServices();
  const leadership = await getTeamMembers('leadership');

  return {
    page,
    services: services.length > 0 ? services.map(s => ({
      ...s,
      features: s.features ? s.features.split(';') : []
    })) : SERVICES_DEFAULT.list, // Fallback if no services in DB
    leadership: leadership.length > 0 ? leadership : ABOUT_DEFAULT.board // Fallback if no team in DB
  };
};
