import type { PostCreateInput } from "validation/post";
import { BaseClient } from "@/settings/api";
import { config } from "@/settings/app";
import type { PostExtended } from "../components/post-card";

export class PostsClient extends BaseClient<
  PostExtended,
  PostCreateInput,
  Partial<PostCreateInput>
> {
  constructor() {
    super(config.api.v1.posts.base);
  }

  public async getPostsWithMedia() {
    const res = await this.client.get(`${this.endpoint}?media=True`);
    return res.data;
  }

  public async getFeed() {
    const res = await this.client.get(`${this.endpoint}feed/`);
    return res.data;
  }

  public async getPostsWithoutMedia() {
    const res = await this.client.get(`${this.endpoint}?media=False`);
    return res.data;
  }

  public async toggleLike(post_id: string) {
    const res = await this.client.post(`${this.endpoint}${post_id}/like/`);
    return res.data;
  }

  public async postComment(post_id: string, data: any) {
    const res = await this.client.post(`${this.endpoint}${post_id}/comments/`, data);
    return res.data;
  }

  public async comments(post_id: string) {
    const res = await this.client.get(`${this.endpoint}${post_id}/comments/`);
    return res.data;
  }

  public async commentReplies(comment_id: string) {
    const res = await this.client.get(`${this.endpoint}${comment_id}/replies/`);
    return res.data;
  }
}

export const postsClient = new PostsClient();
