type BaseQueryState = {
  lastUpdatedAt: number;
};

type IdleQueryState<DataType> = BaseQueryState & {
  state: "idle";
  data: DataType | null; //data can be null or previous data
  error: null;
};

type LoadingQueryState<DataType> = BaseQueryState & {
  state: "loading";
  data: undefined;
  error: null;
};
//Data is in the cache
type FetchingQueryState<DataType> = BaseQueryState & {
  state: "fetching";
  data: DataType;
  error: null;
};

type SuccessQueryState<DataType> = BaseQueryState & {
  state: "success";
  data: DataType;
  error: null;
};

type ErrorQueryState<DataType> = BaseQueryState & {
  state: "error";
  data: undefined;
  error: Error;
};

type FirstSuccessQueryState<DataType> = BaseQueryState & {
  state: "first-success";
  data: DataType;
  error: null;
};

export type QueryState<DataType> =
  | IdleQueryState<DataType>
  | LoadingQueryState<DataType>
  | FetchingQueryState<DataType>
  | SuccessQueryState<DataType>
  | ErrorQueryState<DataType>
  | FirstSuccessQueryState<DataType>;
