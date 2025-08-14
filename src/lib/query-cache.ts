//TODO: Should be extended to support more complex query keys
type QueryKey = string;

export type QueryCacheEntry<TData> = {
  lastUpdatedAt: number;
  data: TData | null;
  state: QueryState<TData>;
};

export interface QueryCacheConfig {
  staleTime?: number;
  gcTime?: number;
}

export class QueryCache {
  private cache: Map<QueryKey, QueryCacheEntry<unknown>> = new Map();
  private subscribers: Map<QueryKey, Set<() => void>> = new Map();
  private staleTime: number;

  constructor(config: QueryCacheConfig) {
    this.cache = new Map();
    this.subscribers = new Map();
    this.staleTime = config.staleTime ?? 0;
  }

  subscribe(key: QueryKey, callback: () => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)?.add(callback);
  }

  unsubscribe(key: QueryKey, callback: () => void) {
    this.subscribers.get(key)?.delete(callback);
  }

  notifySubscribers(key: QueryKey) {
    const subscribers = this.subscribers.get(key);
    if (!subscribers) return;

    subscribers.forEach((callback) => callback());
  }
	
	
}
