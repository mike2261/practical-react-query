import type { Comment } from "@/types/comment";
import { API_URL, req } from "@/utils/api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const fetchComments = async () => {
  const url = `${API_URL}/comments`;
  return req<{ comments: Comment[] }>(url).then((data) => data.comments);
};

export const fetchCommentsOption = () => {
  return queryOptions({
    queryKey: ["comments"],
    queryFn: () => fetchComments(),
  });
};

export const useComments = () => {
  return useQuery(fetchCommentsOption());
}; 