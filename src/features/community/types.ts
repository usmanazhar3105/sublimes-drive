export type UUID = string;

export type CommunityPost = {
  id: UUID;
  user_id: UUID;
  content: string | null;
  is_poll: boolean;
  allow_anonymous: boolean;
  created_at: string;
};

export type CommunityComment = {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  content: string;
  created_at: string;
};

export type CommunityReply = {
  id: UUID;
  comment_id: UUID;
  user_id: UUID;
  content: string;
  created_at: string;
};

export type ToggleResult = { liked: boolean; like_count: number };

