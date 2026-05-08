import { adminRoles, Fields, Role } from "$lib/constants";
import type { iFetchMeta } from "$lib/interface";
import { getUsersBySearchFilter } from "$lib/db/user";
import { getJuryBySearchFilter } from "$lib/db/jury";
import { getAlbumMediaBySearchFilter } from "$lib/db/gallery";
import { getNewsBySearchFilter } from "$lib/db/news";
import { getAwardEntriesBySearchFilter } from "$lib/db/award-entry";
import { getNomineesBySearchFilter } from "$lib/db/nominee";
import { getSponsorshipInquiriesBySearchFilter } from "$lib/db/sponsorship";
import { getWinnersBySearchFilter } from "$lib/db/winners";
import { getTeamBySearchFilter } from "$lib/db/team";
import { json } from "@sveltejs/kit";

export const fetchSearchFilterList = async (params: Record<string, string>, list: Fields) => {
  switch (list) {
    case Fields.USER:
      const usersResult = await getUsersBySearchFilter(params);
      return usersResult.data as iFetchMeta;
    case Fields.JURY:
      const juryResult = await getJuryBySearchFilter(params);
      return juryResult.data as iFetchMeta;
    case Fields.GALLERY_MEDIA:
      const galleryResult = await getAlbumMediaBySearchFilter(params);
      return galleryResult.data as iFetchMeta;
    case Fields.NEWS:
      const newsResult = await getNewsBySearchFilter(params);
      return newsResult.data as iFetchMeta;
    case Fields.AWARDS_ENTRY:
      const awardsResult = await getAwardEntriesBySearchFilter(params);
      return awardsResult.data as iFetchMeta;
    case Fields.NOMINEE:
      const nomineeResult = await getNomineesBySearchFilter(params);
      return nomineeResult.data as iFetchMeta;
    case Fields.SPONSORSHIP:
      const sponsorshipResult = await getSponsorshipInquiriesBySearchFilter(params);
      return sponsorshipResult.data as iFetchMeta;
    case Fields.AWARD_WINNER:
      const winnerResult = await getWinnersBySearchFilter(params);
      return winnerResult.data as iFetchMeta;
    case Fields.AWARDS_TEAM:
      const teamResult = await getTeamBySearchFilter(params);
      return teamResult.data as iFetchMeta;
  }
};

export const authGuard = async (locals: App.Locals, authorizedPersonels?: Role[]) => {
  const user = locals.user;
  if (!user) return { authorized: false, message: 'Unauthenticated' };
  const personnels = authorizedPersonels ? authorizedPersonels : adminRoles;
  if (!personnels.includes(user.role as Role)) return { authorized: false, message: 'Unauthorized' };
  return { authorized: true, message: 'passes check' };
};

export const getSearchFilterList = async (locals: App.Locals, url: URL, field: Fields) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });
  const list = await fetchSearchFilterList(params, field);
  return json(list);
};
