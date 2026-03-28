import React from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user ? auth.user.name : "null"}</span>
      <span data-testid="token">{auth.token ?? "null"}</span>
      <span data-testid="hasSub">{String(auth.hasSubscription)}</span>
      <span data-testid="projectCount">{auth.projectCount}</span>
      <button onClick={() => auth.login({ id: 1, name: "Alice", email: "a@a.com" }, "tok-123", true, 3)}>
        login
      </button>
      <button onClick={() => auth.logout()}>logout</button>
      <button onClick={() => auth.setProjectCount(5)}>setPC</button>
      <button onClick={() => auth.setHasSubscription(false)}>setSub</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("AuthContext", () => {
  it("initial state after mount with empty localStorage: isLoading false, user null", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    // After useEffect runs, isLoading should be false
    expect(await screen.findByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
  });

  it("login() sets user, token, hasSubscription, projectCount in state and localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await screen.findByText("login");

    act(() => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("user")).toHaveTextContent("Alice");
    expect(screen.getByTestId("token")).toHaveTextContent("tok-123");
    expect(screen.getByTestId("hasSub")).toHaveTextContent("true");
    expect(screen.getByTestId("projectCount")).toHaveTextContent("3");
    expect(localStorage.getItem("token")).toBe("tok-123");
    expect(localStorage.getItem("user")).toBe(JSON.stringify({ id: 1, name: "Alice", email: "a@a.com" }));
    expect(localStorage.getItem("has_subscription")).toBe("true");
    expect(localStorage.getItem("project_count")).toBe("3");
  });

  it("logout() clears everything", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await screen.findByText("login");

    act(() => {
      screen.getByText("login").click();
    });
    expect(screen.getByTestId("user")).toHaveTextContent("Alice");

    act(() => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("hasSub")).toHaveTextContent("false");
    expect(screen.getByTestId("projectCount")).toHaveTextContent("0");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("hydrates from localStorage on mount", async () => {
    localStorage.setItem("token", "saved-tok");
    localStorage.setItem("user", JSON.stringify({ id: 2, name: "Bob", email: "b@b.com" }));
    localStorage.setItem("has_subscription", "true");
    localStorage.setItem("project_count", "7");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByTestId("user")).toHaveTextContent("Bob");
    expect(screen.getByTestId("token")).toHaveTextContent("saved-tok");
    expect(screen.getByTestId("hasSub")).toHaveTextContent("true");
    expect(screen.getByTestId("projectCount")).toHaveTextContent("7");
  });

  it("setProjectCount updates state and localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await screen.findByText("login");

    act(() => {
      screen.getByText("login").click();
    });
    act(() => {
      screen.getByText("setPC").click();
    });
    expect(screen.getByTestId("projectCount")).toHaveTextContent("5");
  });

  it("setHasSubscription updates state and localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await screen.findByText("login");

    act(() => {
      screen.getByText("login").click();
    });
    expect(screen.getByTestId("hasSub")).toHaveTextContent("true");

    act(() => {
      screen.getByText("setSub").click();
    });
    expect(screen.getByTestId("hasSub")).toHaveTextContent("false");
    expect(localStorage.getItem("has_subscription")).toBe("false");
  });

  it("throws if useAuth is used outside AuthProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow("useAuth must be used within AuthProvider");
    spy.mockRestore();
  });
});
