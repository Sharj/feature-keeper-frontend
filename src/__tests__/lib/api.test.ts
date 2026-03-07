import { auth, organizations, memberships, boards, statuses, categories, adminIdeas, adminComments, publicBoard, endUserAuth, plans, ApiError } from "@/lib/api";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, options: { status?: number; headers?: Record<string, string> } = {}) {
  const { status = 200, headers = {} } = options;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
    headers: {
      get: (name: string) => headers[name] || null,
    },
  };
}

function mock204() {
  return {
    ok: true,
    status: 204,
    statusText: "No Content",
    json: () => Promise.reject(new Error("No body")),
    headers: { get: () => null },
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("ApiError", () => {
  it("has status and errors properties", () => {
    const err = new ApiError(422, "Validation failed", ["Name is required"]);
    expect(err.message).toBe("Validation failed");
    expect(err.status).toBe(422);
    expect(err.errors).toEqual(["Name is required"]);
  });

  it("defaults errors to empty array", () => {
    const err = new ApiError(500, "Server error");
    expect(err.errors).toEqual([]);
  });
});

describe("request helper", () => {
  it("throws ApiError on non-ok response with error field", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ error: "Not found" }, { status: 404 }));
    try {
      await organizations.list("tok");
      fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(404);
      expect((e as ApiError).message).toBe("Not found");
    }
  });

  it("throws ApiError on non-ok response with errors array", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ errors: ["Bad slug", "Bad name"] }, { status: 422 }));
    try {
      await organizations.list("tok");
      fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toBe("Bad slug, Bad name");
      expect((e as ApiError).errors).toEqual(["Bad slug", "Bad name"]);
    }
  });

  it("falls back to statusText when response has no body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve(null),
      headers: { get: () => null },
    });
    try {
      await organizations.list("tok");
      fail("Should have thrown");
    } catch (e) {
      expect((e as ApiError).message).toBe("Internal Server Error");
    }
  });

  it("captures Authorization header as token", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ user: { id: 1, name: "A", email: "a@b.c" } }, { headers: { Authorization: "Bearer abc123" } })
    );
    const res = await auth.login({ email: "a@b.c", password: "pass" });
    expect(res.token).toBe("abc123");
  });

  it("handles DELETE 204 responses", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    const res = await organizations.delete("tok", 1);
    expect(res.data).toBeUndefined();
  });

  it("sends Authorization header when token provided", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([]));
    await organizations.list("my-token");
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer my-token");
  });

  it("does not send Authorization header when no token", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([]));
    await plans.list();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });
});

describe("auth", () => {
  it("register sends POST /users", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ user: { id: 1, name: "Joe", email: "joe@test.com" } }, { headers: { Authorization: "Bearer tok" } })
    );
    const res = await auth.register({ name: "Joe", email: "joe@test.com", password: "pass123" });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/users"), expect.objectContaining({ method: "POST" }));
    expect(res.data.user.name).toBe("Joe");
    expect(res.token).toBe("tok");
  });

  it("login sends POST /users/sign_in", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ user: { id: 1, name: "Joe", email: "joe@test.com" } }, { headers: { Authorization: "Bearer tok" } })
    );
    const res = await auth.login({ email: "joe@test.com", password: "pass123" });
    expect(mockFetch.mock.calls[0][0]).toContain("/users/sign_in");
    expect(res.data.user.email).toBe("joe@test.com");
  });

  it("logout sends DELETE /users/sign_out", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await auth.logout("tok");
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/users/sign_out");
    expect(init.method).toBe("DELETE");
  });
});

describe("organizations", () => {
  it("list sends GET /organizations", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([{ id: 1, name: "Org1" }]));
    const res = await organizations.list("tok");
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations");
    expect(res.data).toEqual([{ id: 1, name: "Org1" }]);
  });

  it("create sends POST /organizations", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "NewOrg", slug: "new-org" }));
    await organizations.create("tok", { organization: { name: "NewOrg", slug: "new-org" } });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ organization: { name: "NewOrg", slug: "new-org" } });
  });

  it("get sends GET /organizations/:id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 5, name: "Org5" }));
    const res = await organizations.get("tok", 5);
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations/5");
    expect(res.data.id).toBe(5);
  });

  it("update sends PATCH /organizations/:id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 5, name: "Updated" }));
    await organizations.update("tok", 5, { organization: { name: "Updated" } });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/organizations/5");
    expect(init.method).toBe("PATCH");
  });

  it("delete sends DELETE /organizations/:id", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await organizations.delete("tok", 5);
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });

  it("regenerateSsoSecret sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ sso_secret: "new-secret" }));
    const res = await organizations.regenerateSsoSecret("tok", 5);
    expect(mockFetch.mock.calls[0][0]).toContain("/regenerate_sso_secret");
    expect(res.data.sso_secret).toBe("new-secret");
  });

  it("resolve sends GET /organizations/resolve/:slug", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, slug: "acme" }));
    await organizations.resolve("acme");
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations/resolve/acme");
  });
});

describe("memberships", () => {
  it("list sends GET /organizations/:orgId/memberships", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([{ id: 1, role: "admin" }]));
    await memberships.list("tok", 1);
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations/1/memberships");
  });

  it("create sends POST with email and role", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 2, role: "member" }));
    await memberships.create("tok", 1, { email: "x@y.z", role: "member" });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "x@y.z", role: "member" });
  });

  it("update sends PATCH with role", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 2, role: "admin" }));
    await memberships.update("tok", 1, 2, { role: "admin" });
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await memberships.delete("tok", 1, 2);
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("boards", () => {
  it("list sends GET", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([]));
    await boards.list("tok", 1);
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations/1/boards");
  });

  it("create sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "Board1" }));
    await boards.create("tok", 1, { board: { name: "Board1", slug: "board1" } });
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("get sends GET with id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 3 }));
    await boards.get("tok", 1, 3);
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations/1/boards/3");
  });

  it("update sends PATCH", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 3, name: "Updated" }));
    await boards.update("tok", 1, 3, { board: { name: "Updated" } });
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await boards.delete("tok", 1, 3);
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("statuses", () => {
  it("create sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "Open" }));
    await statuses.create("tok", 1, 2, { status: { name: "Open", color: "#333" } });
    expect(mockFetch.mock.calls[0][0]).toContain("/organizations/1/boards/2/statuses");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("update sends PATCH", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "Closed" }));
    await statuses.update("tok", 1, 2, 1, { status: { name: "Closed" } });
    expect(mockFetch.mock.calls[0][0]).toContain("/statuses/1");
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await statuses.delete("tok", 1, 2, 1);
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("categories", () => {
  it("create sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "UX" }));
    await categories.create("tok", 1, 2, { category: { name: "UX", color: "#333" } });
    expect(mockFetch.mock.calls[0][0]).toContain("/categories");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("update sends PATCH", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "Design" }));
    await categories.update("tok", 1, 2, 1, { category: { name: "Design" } });
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await categories.delete("tok", 1, 2, 1);
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("adminIdeas", () => {
  it("updateStatus sends PATCH with status_id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, status: { id: 5 } }));
    await adminIdeas.updateStatus("tok", 1, 2, 10, 5);
    expect(mockFetch.mock.calls[0][0]).toContain("/admin/ideas/10/update_status");
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ status_id: 5 });
  });

  it("updateCategory sends PATCH with category_id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, category: { id: 3 } }));
    await adminIdeas.updateCategory("tok", 1, 2, 10, 3);
    expect(mockFetch.mock.calls[0][0]).toContain("/update_category");
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ category_id: 3 });
  });

  it("updateCategory sends null category_id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, category: null }));
    await adminIdeas.updateCategory("tok", 1, 2, 10, null);
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ category_id: null });
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await adminIdeas.delete("tok", 1, 2, 10);
    expect(mockFetch.mock.calls[0][0]).toContain("/admin/ideas/10");
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("adminComments", () => {
  it("create sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, body: "Nice!" }));
    await adminComments.create("tok", 1, 2, 10, { body: "Nice!" });
    expect(mockFetch.mock.calls[0][0]).toContain("/ideas/10/admin_comments");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce(mock204());
    await adminComments.delete("tok", 1, 2, 10, 5);
    expect(mockFetch.mock.calls[0][0]).toContain("/admin_comments/5");
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

describe("publicBoard", () => {
  it("get sends GET /o/:org/b/:board", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, name: "Features" }));
    const res = await publicBoard.get("acme", "features");
    expect(mockFetch.mock.calls[0][0]).toContain("/o/acme/b/features");
    expect(res.data.name).toBe("Features");
  });

  it("ideas sends GET with query params", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ideas: [], meta: {} }));
    await publicBoard.ideas("acme", "features", { sort: "votes", page: "2" });
    expect(mockFetch.mock.calls[0][0]).toContain("sort=votes");
    expect(mockFetch.mock.calls[0][0]).toContain("page=2");
  });

  it("ideas sends GET without params", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ideas: [], meta: {} }));
    await publicBoard.ideas("acme", "features");
    expect(mockFetch.mock.calls[0][0]).toContain("/o/acme/b/features/ideas");
    expect(mockFetch.mock.calls[0][0]).not.toContain("?");
  });

  it("getIdea sends GET with idea id", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 7, title: "Test" }));
    await publicBoard.getIdea("acme", "features", 7);
    expect(mockFetch.mock.calls[0][0]).toContain("/ideas/7");
  });

  it("createIdea sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 8, title: "New Idea" }));
    await publicBoard.createIdea("acme", "features", {
      idea: { title: "New Idea", description: "Desc" },
      end_user_id: 1,
    });
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("updateIdea sends PATCH", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 8, title: "Updated" }));
    await publicBoard.updateIdea("acme", "features", 8, {
      idea: { title: "Updated" },
      end_user_id: 1,
    });
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
  });

  it("vote sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ voted: true, votes_count: 5 }));
    const res = await publicBoard.vote("acme", "features", 8, 1);
    expect(mockFetch.mock.calls[0][0]).toContain("/ideas/8/vote");
    expect(res.data.voted).toBe(true);
  });

  it("comments sends GET", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([{ id: 1, body: "Hi" }]));
    await publicBoard.comments("acme", "features", 8);
    expect(mockFetch.mock.calls[0][0]).toContain("/ideas/8/comments");
  });

  it("createComment sends POST", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 2, body: "New comment" }));
    await publicBoard.createComment("acme", "features", 8, { body: "New comment", end_user_id: 1 });
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });
});

describe("endUserAuth", () => {
  it("sendCode sends POST /o/:org/auth/email", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, verified: false }));
    await endUserAuth.sendCode("acme", { email: "u@t.co", name: "U" });
    expect(mockFetch.mock.calls[0][0]).toContain("/o/acme/auth/email");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("verify sends GET /o/:org/auth/verify/:token", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, verified: true }));
    await endUserAuth.verify("acme", "abc123");
    expect(mockFetch.mock.calls[0][0]).toContain("/o/acme/auth/verify/abc123");
  });

  it("sso sends POST /o/:org/auth/sso", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, verified: true }));
    await endUserAuth.sso("acme", { sso_token: "jwt-token" });
    expect(mockFetch.mock.calls[0][0]).toContain("/o/acme/auth/sso");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });
});

describe("plans", () => {
  it("list sends GET /plans", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([{ id: 1, name: "Free" }]));
    const res = await plans.list();
    expect(mockFetch.mock.calls[0][0]).toContain("/plans");
    expect(res.data).toEqual([{ id: 1, name: "Free" }]);
  });
});
