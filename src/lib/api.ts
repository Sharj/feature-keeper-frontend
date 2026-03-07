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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (method === "DELETE" && res.status === 204) {
    return { data: undefined as T };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || data?.errors?.join(", ") || res.statusText;
    throw new ApiError(res.status, message, data?.errors || []);
  }

  const result: ApiResponse<T> = { data: data as T };

  // Capture token from response header (login/register)
  const authHeader = res.headers.get("Authorization");
  if (authHeader) {
    result.token = authHeader.replace("Bearer ", "");
  }

  return result;
}

// Auth (Devise)
export const auth = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: import("@/types").User }>("/users", { method: "POST", body: { user: body } }),
  login: (body: { email: string; password: string }) =>
    request<{ user: import("@/types").User }>("/users/sign_in", { method: "POST", body: { user: body } }),
  logout: (token: string) =>
    request<void>("/users/sign_out", { method: "DELETE", token }),
};

// Organizations
export const organizations = {
  list: (token: string) =>
    request<import("@/types").Organization[]>("/organizations", { token }),
  create: (token: string, body: { organization: { name: string; slug: string }; plan_id?: number }) =>
    request<import("@/types").Organization>("/organizations", { method: "POST", body, token }),
  get: (token: string, id: number) =>
    request<import("@/types").Organization>(`/organizations/${id}`, { token }),
  update: (token: string, id: number, body: { organization: { name?: string; auth_mode?: string } }) =>
    request<import("@/types").Organization>(`/organizations/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, id: number) =>
    request<void>(`/organizations/${id}`, { method: "DELETE", token }),
  regenerateSsoSecret: (token: string, id: number) =>
    request<{ sso_secret: string }>(`/organizations/${id}/regenerate_sso_secret`, { method: "POST", token }),
  resolve: (slug: string) =>
    request<{ id: number; name: string; slug: string; auth_mode: string }>(`/organizations/resolve/${slug}`),
};

// Memberships
export const memberships = {
  list: (token: string, orgId: number) =>
    request<import("@/types").Membership[]>(`/organizations/${orgId}/memberships`, { token }),
  create: (token: string, orgId: number, body: { email: string; role: string }) =>
    request<import("@/types").Membership>(`/organizations/${orgId}/memberships`, { method: "POST", body, token }),
  update: (token: string, orgId: number, id: number, body: { role: string }) =>
    request<import("@/types").Membership>(`/organizations/${orgId}/memberships/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, orgId: number, id: number) =>
    request<void>(`/organizations/${orgId}/memberships/${id}`, { method: "DELETE", token }),
};

// Boards (admin)
export const boards = {
  list: (token: string, orgId: number) =>
    request<import("@/types").Board[]>(`/organizations/${orgId}/boards`, { token }),
  create: (token: string, orgId: number, body: { board: { name: string; slug: string; description?: string } }) =>
    request<import("@/types").Board>(`/organizations/${orgId}/boards`, { method: "POST", body, token }),
  get: (token: string, orgId: number, id: number) =>
    request<import("@/types").Board>(`/organizations/${orgId}/boards/${id}`, { token }),
  update: (token: string, orgId: number, id: number, body: { board: Partial<{ name: string; slug: string; description: string }> }) =>
    request<import("@/types").Board>(`/organizations/${orgId}/boards/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, orgId: number, id: number) =>
    request<void>(`/organizations/${orgId}/boards/${id}`, { method: "DELETE", token }),
};

// Statuses (admin)
export const statuses = {
  create: (token: string, orgId: number, boardId: number, body: { status: { name: string; color: string; position?: number; is_default?: boolean } }) =>
    request<import("@/types").Status>(`/organizations/${orgId}/boards/${boardId}/statuses`, { method: "POST", body, token }),
  update: (token: string, orgId: number, boardId: number, id: number, body: { status: Partial<{ name: string; color: string; position: number; is_default: boolean }> }) =>
    request<import("@/types").Status>(`/organizations/${orgId}/boards/${boardId}/statuses/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, orgId: number, boardId: number, id: number) =>
    request<void>(`/organizations/${orgId}/boards/${boardId}/statuses/${id}`, { method: "DELETE", token }),
};

// Categories (admin)
export const categories = {
  create: (token: string, orgId: number, boardId: number, body: { category: { name: string; color: string; position?: number } }) =>
    request<import("@/types").Category>(`/organizations/${orgId}/boards/${boardId}/categories`, { method: "POST", body, token }),
  update: (token: string, orgId: number, boardId: number, id: number, body: { category: Partial<{ name: string; color: string; position: number }> }) =>
    request<import("@/types").Category>(`/organizations/${orgId}/boards/${boardId}/categories/${id}`, { method: "PATCH", body, token }),
  delete: (token: string, orgId: number, boardId: number, id: number) =>
    request<void>(`/organizations/${orgId}/boards/${boardId}/categories/${id}`, { method: "DELETE", token }),
};

// Admin idea moderation
export const adminIdeas = {
  updateStatus: (token: string, orgId: number, boardId: number, ideaId: number, statusId: number) =>
    request<import("@/types").Idea>(`/organizations/${orgId}/boards/${boardId}/admin/ideas/${ideaId}/update_status`, { method: "PATCH", body: { status_id: statusId }, token }),
  updateCategory: (token: string, orgId: number, boardId: number, ideaId: number, categoryId: number | null) =>
    request<import("@/types").Idea>(`/organizations/${orgId}/boards/${boardId}/admin/ideas/${ideaId}/update_category`, { method: "PATCH", body: { category_id: categoryId }, token }),
  delete: (token: string, orgId: number, boardId: number, ideaId: number) =>
    request<void>(`/organizations/${orgId}/boards/${boardId}/admin/ideas/${ideaId}`, { method: "DELETE", token }),
};

// Admin comments (separate endpoint from public comments)
export const adminComments = {
  create: (token: string, orgId: number, boardId: number, ideaId: number, body: { body: string }) =>
    request<import("@/types").Comment>(`/organizations/${orgId}/boards/${boardId}/ideas/${ideaId}/admin_comments`, { method: "POST", body, token }),
  delete: (token: string, orgId: number, boardId: number, ideaId: number, commentId: number) =>
    request<void>(`/organizations/${orgId}/boards/${boardId}/ideas/${ideaId}/admin_comments/${commentId}`, { method: "DELETE", token }),
};

// Public board
export const publicBoard = {
  get: (orgSlug: string, boardSlug: string) =>
    request<import("@/types").Board & { auth_mode: string }>(`/o/${orgSlug}/b/${boardSlug}`),
  ideas: (orgSlug: string, boardSlug: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ ideas: import("@/types").Idea[]; meta: import("@/types").PaginationMeta }>(`/o/${orgSlug}/b/${boardSlug}/ideas${qs}`);
  },
  getIdea: (orgSlug: string, boardSlug: string, id: number) =>
    request<import("@/types").Idea>(`/o/${orgSlug}/b/${boardSlug}/ideas/${id}`),
  createIdea: (orgSlug: string, boardSlug: string, body: { idea: { title: string; description: string; category_id?: number }; end_user_id: number }) =>
    request<import("@/types").Idea>(`/o/${orgSlug}/b/${boardSlug}/ideas`, { method: "POST", body }),
  updateIdea: (orgSlug: string, boardSlug: string, id: number, body: { idea: { title?: string; description?: string }; end_user_id: number }) =>
    request<import("@/types").Idea>(`/o/${orgSlug}/b/${boardSlug}/ideas/${id}`, { method: "PATCH", body }),
  vote: (orgSlug: string, boardSlug: string, ideaId: number, endUserId: number) =>
    request<{ voted: boolean; votes_count: number }>(`/o/${orgSlug}/b/${boardSlug}/ideas/${ideaId}/vote`, { method: "POST", body: { end_user_id: endUserId } }),
  comments: (orgSlug: string, boardSlug: string, ideaId: number) =>
    request<import("@/types").Comment[]>(`/o/${orgSlug}/b/${boardSlug}/ideas/${ideaId}/comments`),
  createComment: (orgSlug: string, boardSlug: string, ideaId: number, body: { body: string; end_user_id: number }) =>
    request<import("@/types").Comment>(`/o/${orgSlug}/b/${boardSlug}/ideas/${ideaId}/comments`, { method: "POST", body }),
};

// End user auth (scoped to org, not board)
export const endUserAuth = {
  sendCode: (orgSlug: string, body: { email: string; name: string }) =>
    request<import("@/types").EndUser & { verification_required?: boolean }>(`/o/${orgSlug}/auth/email`, { method: "POST", body }),
  verify: (orgSlug: string, token: string) =>
    request<import("@/types").EndUser>(`/o/${orgSlug}/auth/verify/${token}`),
  sso: (orgSlug: string, body: { sso_token: string }) =>
    request<import("@/types").EndUser>(`/o/${orgSlug}/auth/sso`, { method: "POST", body }),
};

// Plans
export const plans = {
  list: () => request<import("@/types").Plan[]>("/plans"),
};
