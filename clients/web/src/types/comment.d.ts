import type { UserProfile } from "@campus/api";

export interface Comment {
  id: string;
  author: Pick<UserProfile, "id" | "username" | "avatar">
  content: string;
  is_edited: boolean;
  like_count: number;
  has_replies: boolean;
  object_id: string;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  parent: number | string | null;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}
