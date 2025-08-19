import type { QueryState } from "./query-state";

//TODO: Should be extended to support more complex query keys
type QueryKey = string;

export interface QueryCacheConfig {
  staleTime?: number;
}

export class QueryCache<TData> {
  private cache: Map<QueryKey, QueryState<TData>>;
  private subscribers: Map<QueryKey, Set<() => void>>;
  private ongoingPromises: Map<QueryKey, Promise<TData>>;
  private staleTime: number;

  constructor(config: QueryCacheConfig = {}) {
    this.cache = new Map();
    this.subscribers = new Map();
    this.ongoingPromises = new Map();
    this.staleTime = config.staleTime ?? 0;
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
  private setQueryState = (queryKey: string, state: QueryState<TData>) => {
    this.cache.set(queryKey, state);
    this.notifySubscribers(queryKey);
  };

  getQueryState = (queryKey: string): QueryState<TData> | undefined => {
    return this.cache.get(queryKey);
  };

  fetchQuery = async (
    queryKey: string,
    fetchFn: () => Promise<TData>,
    staleTime: number = this.staleTime
  ): Promise<TData | undefined> => {
    let entry = this.cache.get(queryKey);

    const promise = async () => {
      //Set loading state and notify subscribers
      this.cache.set(queryKey, {
        state: "loading",
        data: undefined,
        error: null,
        lastUpdatedAt: Date.now(),
      });
      this.notifySubscribers(queryKey);
      this.ongoingPromises.set(queryKey, fetchFn());
    };

    if (!entry) {
      return promise;
    }
  };

  // Fetch query directly

  private fetchManually = async (
    queryKey: string,
    fetchFn: () => Promise<TData>
  ) => {
    // if there is deduplication promise, return
    const ongoingPromise = this.ongoingPromises.get(queryKey);
    if (ongoingPromise) return;
    
    try {
      const data = await fetchFn();
      this.cache.set(queryKey, {
        state: "success",
        data,
        error: null,
        lastUpdatedAt: Date.now(),
      });
      return data;
    } catch (error) {
      this.cache.set(queryKey, {
        state: "error",
        data: undefined,
        error: error as Error,
        lastUpdatedAt: Date.now(),
      });
      return undefined;
    } finally {
      this.ongoingPromises.delete(queryKey);
      this.notifySubscribers(queryKey);
    }
  };

  private fetchInBackground = async (
    queryKey: string,
    fetchFn: () => Promise<TData>
  ) => {
    const promise = async () => {
      const data = await fetchFn();
      this.cache.set(queryKey, {
        state: "success",
        data,
      });
    };
  };
}
