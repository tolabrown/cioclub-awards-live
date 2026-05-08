import { browser } from '$app/environment';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants';
import type { iFetchMeta } from '$lib/interface';
import { writable } from 'svelte/store';
import { createInfiniteQuery, type CreateInfiniteQueryResult, QueryClient } from '@tanstack/svelte-query';

export class InfiniteScroll {
  private static instance: InfiniteScroll;
  #queryClient: QueryClient = new QueryClient({ defaultOptions: { queries: { enabled: browser } } });

  public static getInstance(): InfiniteScroll {
    if (!InfiniteScroll.instance) InfiniteScroll.instance = new InfiniteScroll();
    return InfiniteScroll.instance;
  }

  static async fetchList(endpoint: string, offset: number = 0, search: string = '', params?: Record<string, string>) {
    const baseUrl = browser ? window.location.origin : 'http://localhost';
    const url = new URL(endpoint, baseUrl);
    url.searchParams.set("search", search);
    url.searchParams.set("offset", offset.toString());
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }
    const response = await fetch(url);
    let partial = await response.json() as iFetchMeta;
    return { ...partial, lastIndex: offset * MAX_ITEMS_PER_PAGE } as iFetchMeta;
  }

  async queryEndpoint(offset: number = 1, host: string = '', field: string = '', search: string = '') {
    const endpoint = `${host}/api/${field}`;
    return await InfiniteScroll.fetchList(endpoint, offset, search);
  }

  listQuery<T>(paramsGetter: () => Record<string, string>, host: string = '', field: string = ''): CreateInfiniteQueryResult<{ results: T[]; total: number }> {
    // Bridge Svelte 5 runes reactivity → Svelte 4 writable store.
    // @tanstack/svelte-query v5 uses StoreOrVal<T> = T | Readable<T>,
    // NOT a function getter. Passing () => {...} was the root cause of
    // "queryKey needs to be an Array" — the function itself got wrapped 
    // as the store value, so options.queryKey was undefined.
    const buildOptions = (p: Record<string, string>) => ({
      queryKey: [
        'infinite-scroll',
        String(field || 'default'),
        p
      ] as const,
      staleTime: 30000,
      initialPageParam: 1,
      retry: false,
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        const offset = (pageParam - 1) * MAX_ITEMS_PER_PAGE;
        const search = p.search || '';
        const endpoint = `${host}/api/${field}`;
        const finalMeta = await InfiniteScroll.fetchList(endpoint, offset, search, p);

        return {
          results: (finalMeta.data || []) as T[],
          hasMore: finalMeta.meta?.more || false,
          pageParam,
          total: finalMeta.total || 0
        };
      },
      getNextPageParam: (lastPage: any) =>
        lastPage.hasMore ? lastPage.pageParam + 1 : undefined,
      select: (data: any) => {
        let total = 0;
        const results = data.pages.flatMap((page: any) => {
          total = page.total;
          return page.results;
        });
        return { results, total };
      }
    });

    // Create a writable store with the initial options
    const initialParams = paramsGetter();
    const optionsStore = writable(buildOptions(initialParams));

    // Use $effect to react to param changes and push new options into the store.
    // Since this is a .svelte.ts file, $effect is available via runes.
    $effect(() => {
      const p = paramsGetter();
      optionsStore.set(buildOptions(p));
    });

    return createInfiniteQuery(optionsStore, this.#queryClient);
  }

  get queryClient() { return this.#queryClient; }
}

export const infiniteScroll = InfiniteScroll.getInstance();
