import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { fetchSearchFilterList } from '$lib/server';

export const GET: RequestHandler = async ({ url }) => {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });
  const list = await fetchSearchFilterList(params, Fields.GALLERY_MEDIA);
  return json(list);
};
