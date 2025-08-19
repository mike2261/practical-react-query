type BaseQueryState = {
  lastUpdatedAt: number;
};

type IdleQueryState<DataType> = BaseQueryState & {
  status: "idle";
  data: DataType | null; //data can be null or previous data
  error: null;
};

type LoadingQueryState<DataType> = BaseQueryState & {
  status: "loading";
  data: undefined;
  error: null;
};
//Data is in the cache
type FetchingQueryState<DataType> = BaseQueryState & {
  status: "fetching";
  data: DataType;
  error: null;
};

type SuccessQueryState<DataType> = BaseQueryState & {
  status: "success";
  data: DataType;
  error: null;
};

type ErrorQueryState<DataType> = BaseQueryState & {
  status: "error";
  data: DataType | null;
  error: Error;
};

type FirstSuccessQueryState<DataType> = BaseQueryState & {
  status: "first-success";
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
