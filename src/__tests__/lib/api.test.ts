import { auth, projects, adminIdeas, publicBoard, ApiError } from "@/lib/api";

const API_BASE = "/api/v1";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  const headersObj = new Headers(headers);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: headersObj,
    json: () => Promise.resolve(data),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("request() function", () => {
  it("adds Authorization header when token is provided", async () => {
    mockFetch.mockResolvedValue(jsonResponse([]));
    await projects.list("my-token");
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["Authorization"]).toBe("Bearer my-token");
  });

  it("does not add Authorization header when no token", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ name: "board", slug: "test" }));
    await publicBoard.get("test");
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["Authorization"]).toBeUndefined();
  });

  it("extracts token from Authorization response header", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { user: { id: 1, name: "Test", email: "t@t.com" }, has_subscription: true, project_count: 1 },
        200,
        { Authorization: "Bearer new-token-123" }
      )
    );
    const res = await auth.login({ email: "t@t.com", password: "pass" });
    expect(res.token).toBe("new-token-123");
  });

  it("throws ApiError on non-ok responses", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ error: "Invalid credentials" }, 401)
    );
    await expect(auth.login({ email: "t@t.com", password: "wrong" })).rejects.toThrow(ApiError);
    try {
      await auth.login({ email: "t@t.com", password: "wrong" });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(401);
      expect((e as ApiError).message).toBe("Invalid credentials");
    }
  });

  it("throws ApiError with joined errors array", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ errors: ["Email taken", "Name blank"] }, 422)
    );
    try {
      await auth.register({ name: "", email: "t@t.com", password: "pass" });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toBe("Email taken, Name blank");
      expect((e as ApiError).errors).toEqual(["Email taken", "Name blank"]);
    }
  });

  it("handles DELETE 204 responses", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
      headers: new Headers(),
      json: () => Promise.reject(new Error("No body")),
    });
    const res = await auth.logout("my-token");
    expect(res.data).toBeUndefined();
  });
});

describe("API module URL building", () => {
  it("projects.list calls GET /projects", async () => {
    mockFetch.mockResolvedValue(jsonResponse([]));
    await projects.list("tok");
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE}/projects`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("adminIdeas.list builds URL with projectId and query params", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ideas: [], meta: { page: 1, total: 0, total_pages: 0, per_page: 20 } }));
    await adminIdeas.list("tok", 5, { q: "dark", status_id: "2" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(`${API_BASE}/projects/5/ideas`);
    expect(url).toContain("q=dark");
    expect(url).toContain("status_id=2");
  });

  it("publicBoard.get calls GET /p/:slug", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ name: "Acme", slug: "acme" }));
    await publicBoard.get("acme");
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE}/p/acme`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("auth.register calls POST /users with user body", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ user: { id: 1, name: "A", email: "a@a.com" }, has_subscription: false, project_count: 0 }, 200, { Authorization: "Bearer tok" })
    );
    await auth.register({ name: "A", email: "a@a.com", password: "123456" });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/users`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ user: { name: "A", email: "a@a.com", password: "123456" } });
  });
});
