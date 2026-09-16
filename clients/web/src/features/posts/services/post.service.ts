import { postsClient } from "../http/post.http";
import type { PostCreateInput } from "validation/post";

export class PostService {
  constructor() { }

  async create(data: PostCreateInput) {
    return await postsClient.create(data);
  }

  async feed() {
    return await postsClient.getFeed();
  }

  async list(params: Record<string, unknown>) {
    return await postsClient.getAll(params);
  }

  async list_with_media() {
    return await postsClient.getPostsWithMedia();
  }

  async list_without_media() {
    return await postsClient.getPostsWithoutMedia();
  }

  async get(id: string) {
    return await postsClient.getById(id);
  }

  async comments(post_id: string) {
    return await postsClient.comments(post_id);
  }

  async comment_replies(comment_id: string) {
    return await postsClient.commentReplies(comment_id);
  }

  async soft_delete(post_id: string) {
    return await postsClient.delete(post_id);
  }

  async toggleLike(post_id: string) {
    return await postsClient.toggleLike(post_id);
  }

  async postComment(post_id: string, data: any) {
    return await postsClient.postComment(post_id, data);
  }
}

export const posts = new PostService();
