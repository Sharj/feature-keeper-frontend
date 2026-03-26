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
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  website_url: string | null;
  accent_color: string;
  plan: Plan;
  ideas_count: number;
  statuses: Status[];
  topics: Topic[];
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
  published_at: string;
  created_at: string;
  status: { id: number; name: string; color: string } | null;
  topics: { id: number; name: string; color: string }[];
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
