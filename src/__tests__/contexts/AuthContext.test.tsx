import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function TestConsumer() {
  const { user, token, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <span data-testid="token">{token || "null"}</span>
      <button onClick={() => login({ id: 1, name: "Alice", email: "a@b.c" }, "test-token")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("AuthProvider", () => {
  it("starts with isLoading true, then resolves to no user", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    // After useEffect, isLoading should be false
    expect(await screen.findByText("null", { selector: '[data-testid="user"]' })).toBeInTheDocument();
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("restores user from localStorage", async () => {
    localStorage.setItem("token", "saved-token");
    localStorage.setItem("user", JSON.stringify({ id: 2, name: "Bob", email: "b@c.d" }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText("Bob", { selector: '[data-testid="user"]' })).toBeInTheDocument();
    expect(screen.getByTestId("token").textContent).toBe("saved-token");
  });

  it("clears corrupted localStorage data", async () => {
    localStorage.setItem("token", "tok");
    localStorage.setItem("user", "not-valid-json{{{");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText("null", { selector: '[data-testid="user"]' })).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("login stores user and token in state and localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await screen.findByText("null", { selector: '[data-testid="user"]' });

    act(() => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("Alice");
    expect(screen.getByTestId("token").textContent).toBe("test-token");
    expect(localStorage.getItem("token")).toBe("test-token");
    expect(JSON.parse(localStorage.getItem("user")!).name).toBe("Alice");
  });

  it("logout clears user and token", async () => {
    localStorage.setItem("token", "tok");
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "Alice", email: "a@b.c" }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await screen.findByText("Alice", { selector: '[data-testid="user"]' });

    act(() => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    // Suppress error boundary console.error
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    function BadConsumer() {
      useAuth();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow("useAuth must be used within AuthProvider");
    spy.mockRestore();
  });
});
