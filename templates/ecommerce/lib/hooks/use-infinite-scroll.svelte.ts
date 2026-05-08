import { browser } from '$app/environment';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants/index';
import type { iFetchMeta } from '$lib/interface';
import { createInfiniteQuery, QueryClient, type CreateInfiniteQueryResult, type InfiniteData } from '@tanstack/svelte-query';

export class InfiniteScroll {
  private static instance: InfiniteScroll;
  #queryClient: QueryClient = new QueryClient({ defaultOptions: { queries: { enabled: browser } } });

  public static getInstance(): InfiniteScroll {
    if (!InfiniteScroll.instance) InfiniteScroll.instance = new InfiniteScroll();
    return InfiniteScroll.instance;
  }

  static async fetchList(endpoint: string, page: number = 1, search: string = '', params?: Record<string, string>) {
    const url = new URL(endpoint);
    url.searchParams.set("search", search);
    url.searchParams.set("page", page.toString());
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }

  async queryEndpoint(page: number = 1, host: string = '', field: string = '', search: string = '', params?: Record<string, string>) {
    const endpoint = `${host}/api/${field}`;
    return await InfiniteScroll.fetchList(endpoint, page, search, params);
  }

  listQuery<T>(searchTerm: string, host: string = '', field: string = '', params?: Record<string, string>) {
    const self = this;
    return createInfiniteQuery({
      queryKey: [field, searchTerm, params],
      staleTime: 30000,
      initialPageParam: 1,
      retry: false,
      queryFn: async ({ pageParam }) => {
        const result = await self.queryEndpoint(pageParam, host, field, searchTerm, params);
        const results = result.data || [];
        const total = result.meta?.total || 0;
        const hasMore = result.meta?.hasMore || false;
        return { results: results as T[], hasMore, pageParam, total };
      },
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.pageParam + 1 : undefined,
      select: (data) => {
        let total = 0;
        const results = data.pages.map((page) => {
          total = page.total;
          return page.results;
        }).flat();
        return { results, total };
      }
    });
  }

  get queryClient() { return this.#queryClient; }
}

export const infiniteScroll = InfiniteScroll.getInstance();
