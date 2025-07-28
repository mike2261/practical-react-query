import type { PostResponse } from "@/types/post";
import { API_URL, req } from "@/utils/api";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const fetchPosts = async () => {
  const url = `${API_URL}/posts`;
  return req<PostResponse>(url).then((data) => {
    return data.posts;
  });
};

export const fetchPostOption = () => {
	return queryOptions({
		queryKey: ['posts'],
		queryFn: () => fetchPosts(),
		// staleTime: 1000,
	})
}

export const usePosts = () => {
	return useQuery(fetchPostOption())
}