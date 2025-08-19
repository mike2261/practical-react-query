import { QueryClient } from "./query-client";
import { createContext, useContext } from "react";

const QueryClientContext = createContext<QueryClient | undefined>(undefined);

export interface QueryClientProviderProps {
  children: React.ReactNode;
  client: QueryClient;
}

const QueryClientProvider = ({
  children,
  client,
}: QueryClientProviderProps) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
};

const useQueryClient = () => {
  const context = useContext(QueryClientContext);
  if (!context) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }
  return context;
};

export { QueryClientProvider, useQueryClient };
