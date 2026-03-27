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
    request<{ user: import("@/types").User; has_subscription: boolean; project_count: number }>("/users", { method: "POST", body: { user: body } }),
  login: (body: { email: string; password: string }) =>
    request<{ user: import("@/types").User; has_subscription: boolean; project_count: number }>("/users/sign_in", { method: "POST", body: { user: body } }),
  logout: (token: string) =>
    request<void>("/users/sign_out", { method: "DELETE", token }),
};

// Projects (admin)
export const projects = {
  get: (token: string, id: number) =>
    request<import("@/types").Project>(`/projects/${id}`, { token }),
  list: (token: string) =>
    request<import("@/types").Project[]>("/projects", { token }),
  create: (token: string, body: { name: string; slug: string; website_url?: string; accent_color?: string }) =>
    request<import("@/types").Project>("/projects", { method: "POST", body, token }),
  update: (token: string, id: number, body: { project: Partial<{ name: string; slug: string; website_url: string; accent_color: string; require_approval: boolean }> }) =>
    request<import("@/types").Project>(`/projects/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, id: number) =>
    request<void>(`/projects/${id}`, { method: "DELETE", token }),
};

// Admin Ideas
export const adminIdeas = {
  list: (token: string, projectId: number, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ ideas: import("@/types").Idea[]; meta: import("@/types").PaginationMeta }>(`/projects/${projectId}/ideas${qs}`, { token });
  },
  create: (token: string, projectId: number, body: { title: string; description?: string; topic_ids?: number[] }) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas`, { method: "POST", body, token }),
  update: (token: string, projectId: number, id: number, body: { title?: string; description?: string }) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas/${id}`, { method: "PATCH", body, token }),
  updateStatus: (token: string, projectId: number, id: number, status_id: number) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas/${id}/status`, { method: "PATCH", body: { status_id }, token }),
  updateTopics: (token: string, projectId: number, id: number, topic_ids: number[]) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas/${id}/topics`, { method: "PATCH", body: { topic_ids }, token }),
  archive: (token: string, projectId: number, id: number) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas/${id}/archive`, { method: "POST", token }),
  unarchive: (token: string, projectId: number, id: number) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas/${id}/unarchive`, { method: "POST", token }),
  approve: (token: string, projectId: number, id: number) =>
    request<import("@/types").Idea>(`/projects/${projectId}/ideas/${id}/approve`, { method: "POST", token }),
  delete: (token: string, projectId: number, id: number) =>
    request<void>(`/projects/${projectId}/ideas/${id}`, { method: "DELETE", token }),
  vote: (token: string, projectId: number, id: number) =>
    request<{ voted: boolean; votes_count: number }>(`/projects/${projectId}/ideas/${id}/vote`, { method: "POST", token }),
  comments: (token: string, projectId: number, id: number) =>
    request<import("@/types").Comment[]>(`/projects/${projectId}/ideas/${id}/comments`, { token }),
  createComment: (token: string, projectId: number, id: number, body: { body: string }) =>
    request<import("@/types").Comment>(`/projects/${projectId}/ideas/${id}/comments`, { method: "POST", body, token }),
  deleteComment: (token: string, projectId: number, ideaId: number, commentId: number) =>
    request<void>(`/projects/${projectId}/ideas/${ideaId}/comments/${commentId}`, { method: "DELETE", token }),
};

// Admin Statuses
export const statuses = {
  list: (token: string, projectId: number) => request<import("@/types").Status[]>(`/projects/${projectId}/statuses`, { token }),
  create: (token: string, projectId: number, body: { status: { name: string; color: string; position?: number; is_default?: boolean } }) =>
    request<import("@/types").Status>(`/projects/${projectId}/statuses`, { method: "POST", body, token }),
  update: (token: string, projectId: number, id: number, body: { status: Partial<{ name: string; color: string; position: number; is_default: boolean }> }) =>
    request<import("@/types").Status>(`/projects/${projectId}/statuses/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, projectId: number, id: number) =>
    request<void>(`/projects/${projectId}/statuses/${id}`, { method: "DELETE", token }),
};

// Admin Topics
export const topics = {
  list: (token: string, projectId: number) => request<import("@/types").Topic[]>(`/projects/${projectId}/topics`, { token }),
  create: (token: string, projectId: number, body: { topic: { name: string; color: string; position?: number } }) =>
    request<import("@/types").Topic>(`/projects/${projectId}/topics`, { method: "POST", body, token }),
  update: (token: string, projectId: number, id: number, body: { topic: Partial<{ name: string; color: string; position: number }> }) =>
    request<import("@/types").Topic>(`/projects/${projectId}/topics/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, projectId: number, id: number) =>
    request<void>(`/projects/${projectId}/topics/${id}`, { method: "DELETE", token }),
};

// Admin Update Tags
export const updateTags = {
  list: (token: string, projectId: number) => request<import("@/types").UpdateTag[]>(`/projects/${projectId}/update_tags`, { token }),
  create: (token: string, projectId: number, body: { update_tag: { name: string; color: string; position?: number } }) =>
    request<import("@/types").UpdateTag>(`/projects/${projectId}/update_tags`, { method: "POST", body, token }),
  update: (token: string, projectId: number, id: number, body: { update_tag: Partial<{ name: string; color: string; position: number }> }) =>
    request<import("@/types").UpdateTag>(`/projects/${projectId}/update_tags/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, projectId: number, id: number) =>
    request<void>(`/projects/${projectId}/update_tags/${id}`, { method: "DELETE", token }),
};

// Admin Updates
export const adminUpdates = {
  list: (token: string, projectId: number, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ updates: import("@/types").UpdateEntry[]; meta: import("@/types").PaginationMeta }>(`/projects/${projectId}/updates${qs}`, { token });
  },
  get: (token: string, projectId: number, id: number) =>
    request<import("@/types").UpdateEntry>(`/projects/${projectId}/updates/${id}`, { token }),
  create: (token: string, projectId: number, body: { title: string; body: string; update_tag_id?: number; cover_image_url?: string; published_at?: string; idea_ids?: number[] }) =>
    request<import("@/types").UpdateEntry>(`/projects/${projectId}/updates`, { method: "POST", body, token }),
  update: (token: string, projectId: number, id: number, body: { title?: string; body?: string; update_tag_id?: number | null; cover_image_url?: string; published_at?: string | null; idea_ids?: number[] }) =>
    request<import("@/types").UpdateEntry>(`/projects/${projectId}/updates/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, projectId: number, id: number) =>
    request<void>(`/projects/${projectId}/updates/${id}`, { method: "DELETE", token }),
  publish: (token: string, projectId: number, id: number) =>
    request<import("@/types").UpdateEntry>(`/projects/${projectId}/updates/${id}/publish`, { method: "POST", token }),
  unpublish: (token: string, projectId: number, id: number) =>
    request<import("@/types").UpdateEntry>(`/projects/${projectId}/updates/${id}/unpublish`, { method: "POST", token }),
};

// Plans
export const plans = {
  list: () => request<import("@/types").Plan[]>("/plans"),
  choose: (token: string, planId: number) =>
    request<{ subscription: { id: number; plan: import("@/types").Plan } }>(`/plans/${planId}/choose`, { method: "POST", token }),
};

// Subscription
export const subscription = {
  get: (token: string) => request<import("@/types").Subscription>("/subscription", { token }),
  transfer: (token: string, body: { email: string }) =>
    request<{ message: string }>("/subscription/transfer", { method: "POST", body, token }),
};

// Account
export const account = {
  get: (token: string) => request<{ id: number; name: string; email: string; created_at: string }>("/account", { token }),
  update: (token: string, body: { name?: string; email?: string }) =>
    request<{ id: number; name: string; email: string }>("/account", { method: "PATCH", body, token }),
  delete: (token: string) => request<void>("/account", { method: "DELETE", token }),
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
