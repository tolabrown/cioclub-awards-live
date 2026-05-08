import { browser } from '$app/environment';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants';
import type { iFetchMeta } from '$lib/interface';
import { createInfiniteQuery, QueryClient, type CreateInfiniteQueryResult, type InfiniteData } from '@tanstack/svelte-query';

export class InfiniteScroll {

  private static instance: InfiniteScroll
  #loading = $state(false)
  mounted = $state(false)
  #total = $state(0)
  #store = $state<any[]>([])
  #searchTerm = $state('')
  #hasNextPage = $state(false)
  #query: any = null
  #queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  })

  constructor() {
  }

  public static getInstance(): InfiniteScroll {
    if (!InfiniteScroll.instance) {
      InfiniteScroll.instance = new InfiniteScroll();
    }
    return InfiniteScroll.instance;
  }
  // initialize(endpoint: string) {
  //   this.#endpoint = endpoint
  //   this.initObserver()
  // }

  static async fetchList(endpoint: string, offset: number = 0, search: string = '', params?: Record<string, string>) {

    const url = new URL(endpoint)
    url.searchParams.set("search", search)
    url.searchParams.set("offset", offset.toString())

    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.set(key, params[key])
      })
    }

    const response = await fetch(url)

    let partial = await response.json() as iFetchMeta

    const metalist: iFetchMeta = { ...partial, lastIndex: offset * MAX_ITEMS_PER_PAGE }
    return metalist
  }

  static async fetchListAlternate(endpoint: string, params: Record<string, any>) {

    const url = new URL(endpoint)

    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.set(key, params[key])
      })
    }

    const response = await fetch(url)

    let partial = await response.json() as iFetchMeta

    const offset = Number(params.offset)
    const metalist: iFetchMeta = { ...partial, lastIndex: offset * MAX_ITEMS_PER_PAGE }
    return metalist
  }

  async queryEndpoint(offset: number = 1, host: string = '', field: string = '', search: string = '', params?: Record<string, string>) {
    const endpoint = `${host}/api/${field}`;
    const metalist = await InfiniteScroll.fetchList(endpoint, offset, search, params);
    return metalist;
  }

  async queryEndpointAlternate(offset: number = 1, params: Record<string, string>) {
    const { host, field } = params
    const endpoint = `${host}/api/${field}`;
    params.offset = offset.toString()
    const metalist = await InfiniteScroll.fetchListAlternate(endpoint, params);
    return metalist;
  }

  listQueryAlternate<T>(params: Record<string, any>) {
    const self = this
    const { field, search, host, ...filterParams } = params

    // Build a stable query key from all filter parameters
    // Sort keys alphabetically for consistent cache key ordering
    const filterKeys = Object.keys(filterParams).sort()
    const filterValues = filterKeys.map(key => String(filterParams[key] || ''))

    return createInfiniteQuery({
      queryKey: [field, search || '', ...filterValues],
      staleTime: 30000,
      initialPageParam: 1,
      retry: false, // Disable retries to prevent multiple calls
      queryFn: async (args) => {
        const { pageParam } = args;
        let offset: any = (pageParam - 1) * MAX_ITEMS_PER_PAGE;
        const metalist = await self.queryEndpointAlternate(
          offset,
          params
        );
        const { data, meta, total } = metalist
        if (meta) {
          return { results: data as T[], hasMore: meta.more, pageParam, total };
        } else {
          return { results: [], hasMore: false, pageParam, total };
        }
      },
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.pageParam + 1 : undefined;
      },
      select: (data) => {
        let total = 0
        const results = data.pages.map((page) => {
          total = page.total
          return page.results
        }).flat();
        return { results, total };
      }
    })
  }


  listQuery<T>(searchTerm: string, host: string = '', field: string = '', params?: Record<string, string>) {
    const self = this
    return createInfiniteQuery({
      queryKey: [field, searchTerm],
      staleTime: 30000,
      initialPageParam: 1,
      retry: false, // Disable retries to prevent multiple calls
      queryFn: async (args) => {
        const { pageParam } = args;
        let offset: any = (pageParam - 1) * MAX_ITEMS_PER_PAGE;
        const metalist = await self.queryEndpoint(
          offset,
          host,
          field,
          searchTerm
        );
        const { data, meta, total } = metalist
        if (meta) {
          return { results: data as T[], hasMore: meta.more, pageParam, total };
        } else {
          return { results: [], hasMore: false, pageParam, total };
        }
      },
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.pageParam + 1 : undefined;
      },
      select: (data) => {
        let total = 0
        const results = data.pages.map((page) => {
          total = page.total
          return page.results
        }).flat();
        return { results, total };
      }
    })
  }

  async onkeyup(evt: Event) {
    const searchTerm = (evt.target as HTMLInputElement).value;
    this.#searchTerm = searchTerm
  }

  reset(evt: Event) {
    location.reload()
  }

  get loading() {
    return this.#loading
  }

  get total() {
    return this.#total
  }

  get store() {
    return this.#store
  }

  get searchTerm() {
    return this.#searchTerm
  }

  get hasNextPage() {
    return this.#hasNextPage
  }

  get query() {
    return this.#query as CreateInfiniteQueryResult<InfiniteData<{
      results: any[];
      hasMore: boolean;
      pageParam: any;
    }, unknown>, Error>
  }

  get queryClient() {
    return this.#queryClient
  }
}

export const infiniteScroll = InfiniteScroll.getInstance()

export function useInfiniteScroll({
  onLoadMore,
  disabled,
}: {
  onLoadMore: () => void;
  disabled: () => boolean;
}) {
  function sentinel(node: HTMLElement) {
    let observer: IntersectionObserver;

    if (browser) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !disabled()) {
          onLoadMore();
        }
      });

      observer.observe(node);
    }

    return {
      destroy() {
        if (observer) observer.disconnect();
      },
    };
  }

  return { sentinel };
}