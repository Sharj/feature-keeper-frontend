export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  max_ideas: number | null;
  max_seats: number;
  max_projects: number | null;
  features?: Record<string, boolean>;
}

export interface Subscription {
  id: number;
  plan: Plan;
  projects_count: number;
  projects_remaining: number | null;
  owner: { id: number; name: string; email: string };
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  website_url: string | null;
  accent_color: string;
  require_approval: boolean;
  plan: Plan;
  ideas_count: number;
  statuses: Status[];
  topics: Topic[];
  update_tags: UpdateTag[];
  created_at: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  ideas_count?: number;
}

export interface Topic {
  id: number;
  name: string;
  color: string;
  position: number;
  ideas_count?: number;
}

export interface UpdateTag {
  id: number;
  name: string;
  color: string;
  position: number;
  updates_count?: number;
}

export interface Idea {
  id: number;
  title: string;
  description: string | null;
  author_name: string;
  author_email?: string;
  source: "public" | "admin";
  votes_count: number;
  comments_count: number;
  voted: boolean;
  archived?: boolean;
  pending?: boolean;
  published_at: string | null;
  created_at: string;
  status: { id: number; name: string; color: string } | null;
  topics: { id: number; name: string; color: string }[];
  updates?: { id: number; title: string }[];
}

export interface Comment {
  id: number;
  body: string;
  is_official: boolean;
  author: { name: string; is_admin: boolean };
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PublicBoard {
  name: string;
  slug: string;
  website_url: string | null;
  accent_color: string;
  statuses: (Status & { ideas_count: number })[];
  topics: (Topic & { ideas_count: number })[];
}

export interface RoadmapStatus {
  id: number;
  name: string;
  color: string;
  ideas: {
    id: number;
    title: string;
    votes_count: number;
    comments_count: number;
    topics: { id: number; name: string; color: string }[];
  }[];
}

export interface UpdateEntry {
  id: number;
  title: string;
  body?: string;
  tag: { id: number; name: string; color: string } | null;
  cover_image_url?: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  ideas_count?: number;
  ideas?: { id: number; title: string; votes_count: number }[];
}
