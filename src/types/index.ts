export interface User {
  id: number;
  name: string;
  email: string;
}

export interface EndUser {
  id: number;
  name: string;
  email: string;
  auth_method: "email" | "sso";
  verified: boolean;
  avatar_url: string | null;
  verification_required?: boolean;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  auth_mode: "email_only" | "sso_only" | "both";
  sso_secret?: string;
  plan?: { id: number; name: string; slug: string };
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  price_cents: number;
  billing_interval: "month" | "year";
  max_boards: number | null;
  max_ideas_per_board: number | null;
  features: Record<string, unknown>;
  position: number;
}

export interface Membership {
  id: number;
  role: "owner" | "admin" | "moderator" | "member";
  user: User;
  created_at: string;
}

export interface Board {
  id: number;
  name: string;
  slug: string;
  description: string;
  ideas_count: number;
  statuses?: Status[];
  categories?: Category[];
  created_at: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  position: number;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  votes_count: number;
  comments_count: number;
  status: Status | null;
  category: Category | null;
  author: { id: number; name: string; avatar_url: string | null };
  created_at: string;
  voted_by_end_user_ids?: number[];
}

export interface Comment {
  id: number;
  body: string;
  admin_comment: boolean;
  author: {
    id: number;
    name: string;
    avatar_url?: string | null;
    admin?: boolean;
  };
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}
