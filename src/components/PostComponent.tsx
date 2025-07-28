import { fetchPostOption } from "@/services/posts";
import { useQuery } from "@tanstack/react-query";

export const PostComponent = () => {
  const { data: posts, isLoading, isFetching } = useQuery(fetchPostOption());
  console.log(isLoading, isFetching);
  return <div>{posts?.length}</div>;
};
