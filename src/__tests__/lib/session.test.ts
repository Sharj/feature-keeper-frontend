import { getSessionId } from "@/lib/session";

beforeEach(() => {
  localStorage.clear();
  mockUUID.mockReset();
});

// Mock crypto.randomUUID
const mockUUID = jest.fn();
Object.defineProperty(global, "crypto", {
  value: { randomUUID: mockUUID },
  writable: true,
});

describe("getSessionId", () => {
  it("generates a UUID and stores it in localStorage", () => {
    mockUUID.mockReturnValue("uuid-abc-123");
    const id = getSessionId("my-board");
    expect(id).toBe("uuid-abc-123");
    expect(localStorage.getItem("fk_session_my-board")).toBe("uuid-abc-123");
  });

  it("returns the same ID on subsequent calls for the same slug", () => {
    mockUUID.mockReturnValue("uuid-first");
    const first = getSessionId("acme");
    mockUUID.mockReturnValue("uuid-second");
    const second = getSessionId("acme");
    expect(first).toBe(second);
    expect(first).toBe("uuid-first");
    expect(mockUUID).toHaveBeenCalledTimes(1);
  });

  it("returns different IDs for different slugs", () => {
    mockUUID.mockReturnValueOnce("uuid-aaa").mockReturnValueOnce("uuid-bbb");
    const a = getSessionId("board-a");
    const b = getSessionId("board-b");
    expect(a).toBe("uuid-aaa");
    expect(b).toBe("uuid-bbb");
    expect(a).not.toBe(b);
  });
});
