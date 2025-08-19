import { QueryCache } from "./query-cache";

interface QueryClientConfig {
  staleTime?: number;
}

export class QueryClient {
  private queryCache: QueryCache;

  constructor(config?: QueryClientConfig) {
    this.queryCache = new QueryCache(config);
  }

  fetchQuery = async <TData>(
    queryKey: string,
    queryFn: () => Promise<TData>
  ) => {
    return await this.queryCache.fetchQuery(queryKey, queryFn);
  };

  refetchQuery = async (queryKey: string) => {
    return await this.queryCache.refetchQuery(queryKey);
  };

  invalidateQuery = async (queryKey: string) => {
    return await this.queryCache.invalidateQuery(queryKey);
  };

  getQueryData = <TData>(queryKey: string) => {
    return this.queryCache.getQueryState(queryKey)?.state.data as TData;
  };

  setQueryData = <TData>(queryKey: string, data: TData) => {
    return this.queryCache.setQueryData(queryKey, data);
  };

  subscribe = (queryKey: string, callback: () => void) => {
    return this.queryCache.subscriber(queryKey, callback);
  };
}
