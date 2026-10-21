import { useQuery, useMutation } from "@tanstack/react-query";
import { posts } from "../services/post.service";
import type { PostCreateInput } from "validation/post";
import { queryClient } from "@/config/query-client";

export const usePosts = (params?: Record<string, unknown>) => {
  const list = useQuery({
    queryKey: ["posts"],
    queryFn: () => posts.list(params || {}),
  });

  const listWithMedia = useQuery({
    queryKey: ["posts", "media", "True"],
    queryFn: () => posts.list_with_media(),
  });

  const listWithoutMedia = useQuery({
    queryKey: ["posts", "media", "False"],
    queryFn: () => posts.list_without_media(),
  });

  const create = useMutation({
    mutationFn: (data: PostCreateInput) => posts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { list, create, listWithMedia, listWithoutMedia };
};

export const usePost = (id: string) => {
  const retrieve = useQuery({
    queryKey: ["posts", id],
    queryFn: () => posts.get(id),
    enabled: !!id,
  });

  const softDelete = useMutation({
    mutationFn: () => posts.soft_delete(id),
  });

  const comments = useQuery({
    queryKey: ["posts", id, "comments"],
    queryFn: () => posts.comments(id),
  });

  const replies = (comment_id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["posts", id, "comments", comment_id, "replies"],
      queryFn: () => posts.comment_replies(comment_id),
      enabled: !!comment_id && (options?.enabled ?? true),
    });

  const postComments = useMutation({
    mutationFn: (data: any) => posts.postComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", id, "comments"] });
    },
  });

  const toggleLike = useMutation({
    mutationFn: () => posts.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
    },
  });

  return { retrieve, softDelete, comments, toggleLike, postComments, replies };
};


export const useFeed = () => {
  const feed = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: () => posts.feed(),
  });
  return { feed };
};