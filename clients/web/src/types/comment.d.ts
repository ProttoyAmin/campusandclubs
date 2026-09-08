export interface Comment {
  id: number | string;
  author_id: number;
  author_username: string;
  author_avatar?: string;
  profile_picture_url?: string;
  content: string;
  is_edited: boolean;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  parent: number | string | null;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}
