import type { QueryState } from "./query-state";

const DEFAULT_STALE_TIME = 0;
const FORCE_STALE_TIME = -1;

//TODO: Should be extended to support more complex query keys
type QueryKey = string;

type CacheEntry<TData> = {
  state: QueryState<TData>;
  queryFn?: () => Promise<TData>;
};

export interface QueryCacheConfig {
  staleTime?: number;
}

export class QueryCache {
  private cache: Map<QueryKey, CacheEntry<any>>;
  private subscribers: Map<QueryKey, Set<() => void>>;
  private ongoingPromises: Map<QueryKey, Promise<any>>;
  private staleTime: number;

  constructor(config: QueryCacheConfig = {}) {
    this.cache = new Map();
    this.subscribers = new Map();
    this.ongoingPromises = new Map();
    this.staleTime = config.staleTime ?? DEFAULT_STALE_TIME;
  }

  subscriber = (queryKey: string, cb: () => void) => {
    if (!this.subscribers.has(queryKey)) {
      this.subscribers.set(queryKey, new Set());
    }
    this.subscribers.get(queryKey)?.add(cb);
  };

  unsubscribe = (queryKey: string, cb: () => void) => {
    const sets = this.subscribers.get(queryKey);
    if (!sets) return;
    sets.delete(cb);
  };

  getStateByQueryKey = (queryKey: string) => {
    return this.cache.get(queryKey)?.state;
  };

  private notifySubscribers = (queryKey: string) => {
    const sets = this.subscribers.get(queryKey);
    if (!sets) return;
    sets.forEach((cb) => cb());
  };

  // Set query state and notify subscribers
  private setQueryStateAndNotify = (
    queryKey: string,
    state: QueryState<any>,
    queryFn?: () => Promise<any>
  ) => {
    this.cache.set(queryKey, { state, queryFn });
    this.notifySubscribers(queryKey);
  };

  setQueryData = <TData>(queryKey: string, data: TData) => {
    const entry = this.cache.get(queryKey);
    if (!entry) return;
    this.setQueryStateAndNotify(
      queryKey,
      {
        status: "success",
        data,
        error: null,
        lastUpdatedAt: Date.now(),
      },
      entry.queryFn
    );
  };

  getQueryState = (queryKey: string): CacheEntry<any> | undefined => {
    return this.cache.get(queryKey);
  };

  // Decide whether to fetch manually or in background
  fetchQuery = async (
    queryKey: string,
    queryFn: () => Promise<any>
  ): Promise<void> => {
    const entry = this.cache.get(queryKey);
    if (!entry) return await this.fetchManually(queryKey, queryFn);
    return await this.fetchInBackground(queryKey, queryFn);
  };

  // Fetch query directly
  private fetchManually = async (
    queryKey: string,
    queryFn: () => Promise<any>
  ): Promise<void> => {
    // If there is in-flight promise, no need to trigger a new request
    const ongoingPromise = this.ongoingPromises.get(queryKey);
    const entry = this.cache.get(queryKey);

    if (ongoingPromise) return;

    this.setQueryStateAndNotify(queryKey, {
      status: "loading",
      data: undefined,
      error: null,
      lastUpdatedAt: Date.now(),
    });

    this.ongoingPromises.set(queryKey, queryFn());

    const isFirstFetch = !entry?.state.data;

    try {
      const data = await queryFn();
      this.setQueryStateAndNotify(queryKey, {
        status: isFirstFetch ? "first-success" : "success",
        data,
        error: null,
        lastUpdatedAt: Date.now(),
      });
    } catch (error) {
      this.setQueryStateAndNotify(queryKey, {
        status: "error",
        data: null,
        error: error as Error,
        lastUpdatedAt: FORCE_STALE_TIME,
      });
    } finally {
      this.ongoingPromises.delete(queryKey);
    }
  };

  // Use for revalidation
  // Happens after the query is successfully fetched before and entry is not stale
  private fetchInBackground = async (
    queryKey: string,
    queryFn: () => Promise<any>
  ): Promise<void> => {
    const ongoingPromise = this.ongoingPromises.get(queryKey);
    const entry = this.cache.get(queryKey);

    if (ongoingPromise) return;
    if (!entry) return;
    if (entry.state.status === "fetching") return;
    if (
      entry.state.status !== "success" &&
      entry.state.status !== "first-success"
    )
      return;
    this.ongoingPromises.set(queryKey, queryFn());

    const staleTime = entry.state.lastUpdatedAt + this.staleTime;
    const isStale = Date.now() > staleTime;

    if (!isStale) return;

    this.setQueryStateAndNotify(queryKey, {
      status: "fetching",
      data: entry.state.data,
      error: null,
      lastUpdatedAt: Date.now(),
    });

    try {
      const data = await queryFn();
      this.setQueryStateAndNotify(queryKey, {
        status: "success",
        data,
        error: null,
        lastUpdatedAt: Date.now(),
      });
    } catch (error) {
      this.setQueryStateAndNotify(queryKey, {
        status: "error",
        data: entry.state.data,
        error: error as Error,
        lastUpdatedAt: FORCE_STALE_TIME,
      });
    } finally {
      this.ongoingPromises.delete(queryKey);
    }
  };

  refetchQuery = async (queryKey: string) => {
    const entry = this.cache.get(queryKey);
    if (!entry) return;
    if (!entry.queryFn) return;
    return await this.fetchManually(queryKey, entry.queryFn);
  };

  invalidateQuery = async (queryKey: string) => {
    const entry = this.cache.get(queryKey);
    if (!entry) return;

    this.setQueryStateAndNotify(
      queryKey,
      {
        status: "success",
        data: entry.state.data,
        error: null,
        lastUpdatedAt: FORCE_STALE_TIME,
      },
      entry.queryFn
    );
    if (!entry.queryFn) return;
    return await this.fetchInBackground(queryKey, entry.queryFn);
  };
}
