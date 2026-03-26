const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  errors: string[];
  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface ApiResponse<T> {
  data: T;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = "GET", body, token, headers: extraHeaders } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extraHeaders };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (method === "DELETE" && res.status === 204) return { data: undefined as T };

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || data?.errors?.join(", ") || res.statusText;
    throw new ApiError(res.status, message, data?.errors || []);
  }

  const result: ApiResponse<T> = { data: data as T };
  const authHeader = res.headers.get("Authorization");
  if (authHeader) result.token = authHeader.replace("Bearer ", "");
  return result;
}

// Auth
export const auth = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: import("@/types").User; has_project: boolean }>("/users", { method: "POST", body: { user: body } }),
  login: (body: { email: string; password: string }) =>
    request<{ user: import("@/types").User; has_project: boolean }>("/users/sign_in", { method: "POST", body: { user: body } }),
  logout: (token: string) =>
    request<void>("/users/sign_out", { method: "DELETE", token }),
};

// Project (admin)
export const project = {
  setup: (token: string, body: { name: string; slug: string; website_url?: string; accent_color?: string }) =>
    request<import("@/types").Project>("/projects/setup", { method: "POST", body, token }),
  get: (token: string) =>
    request<import("@/types").Project>("/project", { token }),
  update: (token: string, body: { project: Partial<{ name: string; slug: string; website_url: string; accent_color: string; require_approval: boolean }> }) =>
    request<import("@/types").Project>("/project", { method: "PATCH", body, token }),
  delete: (token: string) =>
    request<void>("/project", { method: "DELETE", token }),
};

// Admin Ideas
export const adminIdeas = {
  list: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ ideas: import("@/types").Idea[]; meta: import("@/types").PaginationMeta }>(`/project/ideas${qs}`, { token });
  },
  create: (token: string, body: { title: string; description?: string; topic_ids?: number[] }) =>
    request<import("@/types").Idea>("/project/ideas", { method: "POST", body, token }),
  update: (token: string, id: number, body: { title?: string; description?: string }) =>
    request<import("@/types").Idea>(`/project/ideas/${id}`, { method: "PATCH", body, token }),
  updateStatus: (token: string, id: number, status_id: number) =>
    request<import("@/types").Idea>(`/project/ideas/${id}/status`, { method: "PATCH", body: { status_id }, token }),
  updateTopics: (token: string, id: number, topic_ids: number[]) =>
    request<import("@/types").Idea>(`/project/ideas/${id}/topics`, { method: "PATCH", body: { topic_ids }, token }),
  archive: (token: string, id: number) =>
    request<import("@/types").Idea>(`/project/ideas/${id}/archive`, { method: "POST", token }),
  unarchive: (token: string, id: number) =>
    request<import("@/types").Idea>(`/project/ideas/${id}/unarchive`, { method: "POST", token }),
  approve: (token: string, id: number) =>
    request<import("@/types").Idea>(`/project/ideas/${id}/approve`, { method: "POST", token }),
  delete: (token: string, id: number) =>
    request<void>(`/project/ideas/${id}`, { method: "DELETE", token }),
  vote: (token: string, id: number) =>
    request<{ voted: boolean; votes_count: number }>(`/project/ideas/${id}/vote`, { method: "POST", token }),
  comments: (token: string, id: number) =>
    request<import("@/types").Comment[]>(`/project/ideas/${id}/comments`, { token }),
  createComment: (token: string, id: number, body: { body: string }) =>
    request<import("@/types").Comment>(`/project/ideas/${id}/comments`, { method: "POST", body, token }),
  deleteComment: (token: string, ideaId: number, commentId: number) =>
    request<void>(`/project/ideas/${ideaId}/comments/${commentId}`, { method: "DELETE", token }),
};

// Admin Statuses
export const statuses = {
  list: (token: string) => request<import("@/types").Status[]>("/project/statuses", { token }),
  create: (token: string, body: { status: { name: string; color: string; position?: number; is_default?: boolean } }) =>
    request<import("@/types").Status>("/project/statuses", { method: "POST", body, token }),
  update: (token: string, id: number, body: { status: Partial<{ name: string; color: string; position: number; is_default: boolean }> }) =>
    request<import("@/types").Status>(`/project/statuses/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, id: number) =>
    request<void>(`/project/statuses/${id}`, { method: "DELETE", token }),
};

// Admin Topics
export const topics = {
  list: (token: string) => request<import("@/types").Topic[]>("/project/topics", { token }),
  create: (token: string, body: { topic: { name: string; color: string; position?: number } }) =>
    request<import("@/types").Topic>("/project/topics", { method: "POST", body, token }),
  update: (token: string, id: number, body: { topic: Partial<{ name: string; color: string; position: number }> }) =>
    request<import("@/types").Topic>(`/project/topics/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, id: number) =>
    request<void>(`/project/topics/${id}`, { method: "DELETE", token }),
};

// Admin Updates
export const adminUpdates = {
  list: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ updates: import("@/types").UpdateEntry[]; meta: import("@/types").PaginationMeta }>(`/project/updates${qs}`, { token });
  },
  get: (token: string, id: number) =>
    request<import("@/types").UpdateEntry>(`/project/updates/${id}`, { token }),
  create: (token: string, body: { title: string; body: string; label: string; cover_image_url?: string; published_at?: string; idea_ids?: number[] }) =>
    request<import("@/types").UpdateEntry>("/project/updates", { method: "POST", body, token }),
  update: (token: string, id: number, body: { title?: string; body?: string; label?: string; cover_image_url?: string; published_at?: string | null; idea_ids?: number[] }) =>
    request<import("@/types").UpdateEntry>(`/project/updates/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, id: number) =>
    request<void>(`/project/updates/${id}`, { method: "DELETE", token }),
  publish: (token: string, id: number) =>
    request<import("@/types").UpdateEntry>(`/project/updates/${id}/publish`, { method: "POST", token }),
  unpublish: (token: string, id: number) =>
    request<import("@/types").UpdateEntry>(`/project/updates/${id}/unpublish`, { method: "POST", token }),
};

// Public board
export const publicBoard = {
  get: (slug: string) => request<import("@/types").PublicBoard>(`/p/${slug}`),
  ideas: (slug: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ ideas: import("@/types").Idea[]; meta: import("@/types").PaginationMeta }>(`/p/${slug}/ideas${qs}`);
  },
  getIdea: (slug: string, id: number, sessionId?: string) => {
    const qs = sessionId ? `?session_id=${sessionId}` : "";
    return request<import("@/types").Idea>(`/p/${slug}/ideas/${id}${qs}`);
  },
  createIdea: (slug: string, body: { title: string; description?: string; author_name: string; author_email: string; topic_ids?: number[] }) =>
    request<{ id: number; title: string; pending_approval?: boolean }>(`/p/${slug}/ideas`, { method: "POST", body }),
  vote: (slug: string, ideaId: number, sessionId: string) =>
    request<{ voted: boolean; votes_count: number }>(`/p/${slug}/ideas/${ideaId}/vote`, { method: "POST", body: { session_id: sessionId } }),
  updates: (slug: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ updates: import("@/types").UpdateEntry[]; meta: import("@/types").PaginationMeta }>(`/p/${slug}/updates${qs}`);
  },
  getUpdate: (slug: string, id: number) =>
    request<import("@/types").UpdateEntry>(`/p/${slug}/updates/${id}`),
  roadmap: (slug: string) => request<import("@/types").RoadmapStatus[]>(`/p/${slug}/roadmap`),
  comments: (slug: string, ideaId: number) =>
    request<import("@/types").Comment[]>(`/p/${slug}/ideas/${ideaId}/comments`),
  createComment: (slug: string, ideaId: number, body: { body: string; author_name: string; author_email: string }) =>
    request<import("@/types").Comment>(`/p/${slug}/ideas/${ideaId}/comments`, { method: "POST", body }),
};
