import { render, screen, act } from "@testing-library/react";
import { EndUserProvider, useEndUser } from "@/contexts/EndUserContext";

function TestConsumer() {
  const { endUserId, name, email, setEndUser, clearEndUser, storageKey } = useEndUser();
  return (
    <div>
      <span data-testid="endUserId">{endUserId ?? "null"}</span>
      <span data-testid="name">{name ?? "null"}</span>
      <span data-testid="email">{email ?? "null"}</span>
      <span data-testid="storageKey">{storageKey}</span>
      <button onClick={() => setEndUser({ end_user_id: 42, name: "Jane", email: "jane@test.com" })}>setUser</button>
      <button onClick={() => clearEndUser()}>clear</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("EndUserProvider", () => {
  it("starts with null state", async () => {
    render(
      <EndUserProvider orgSlug="acme" boardSlug="features">
        <TestConsumer />
      </EndUserProvider>
    );

    expect(screen.getByTestId("endUserId").textContent).toBe("null");
    expect(screen.getByTestId("name").textContent).toBe("null");
    expect(screen.getByTestId("storageKey").textContent).toBe("enduser_acme_features");
  });

  it("restores from localStorage", async () => {
    localStorage.setItem("enduser_acme_features", JSON.stringify({
      end_user_id: 10, name: "Stored", email: "s@t.co",
    }));

    render(
      <EndUserProvider orgSlug="acme" boardSlug="features">
        <TestConsumer />
      </EndUserProvider>
    );

    expect(await screen.findByText("10", { selector: '[data-testid="endUserId"]' })).toBeInTheDocument();
    expect(screen.getByTestId("name").textContent).toBe("Stored");
    expect(screen.getByTestId("email").textContent).toBe("s@t.co");
  });

  it("handles corrupted localStorage gracefully", async () => {
    localStorage.setItem("enduser_acme_features", "not-json!!!");

    render(
      <EndUserProvider orgSlug="acme" boardSlug="features">
        <TestConsumer />
      </EndUserProvider>
    );

    // Should clear invalid data and remain null
    expect(await screen.findByText("null", { selector: '[data-testid="endUserId"]' })).toBeInTheDocument();
    expect(localStorage.getItem("enduser_acme_features")).toBeNull();
  });

  it("setEndUser updates state and localStorage", async () => {
    render(
      <EndUserProvider orgSlug="acme" boardSlug="features">
        <TestConsumer />
      </EndUserProvider>
    );

    act(() => {
      screen.getByText("setUser").click();
    });

    expect(screen.getByTestId("endUserId").textContent).toBe("42");
    expect(screen.getByTestId("name").textContent).toBe("Jane");
    expect(screen.getByTestId("email").textContent).toBe("jane@test.com");
    expect(JSON.parse(localStorage.getItem("enduser_acme_features")!).end_user_id).toBe(42);
  });

  it("clearEndUser resets state and removes localStorage", async () => {
    localStorage.setItem("enduser_acme_features", JSON.stringify({
      end_user_id: 10, name: "X", email: "x@y.z",
    }));

    render(
      <EndUserProvider orgSlug="acme" boardSlug="features">
        <TestConsumer />
      </EndUserProvider>
    );

    await screen.findByText("10", { selector: '[data-testid="endUserId"]' });

    act(() => {
      screen.getByText("clear").click();
    });

    expect(screen.getByTestId("endUserId").textContent).toBe("null");
    expect(localStorage.getItem("enduser_acme_features")).toBeNull();
  });

  it("uses different storage keys for different org/board combos", () => {
    const { unmount } = render(
      <EndUserProvider orgSlug="org1" boardSlug="board1">
        <TestConsumer />
      </EndUserProvider>
    );
    expect(screen.getByTestId("storageKey").textContent).toBe("enduser_org1_board1");
    unmount();

    render(
      <EndUserProvider orgSlug="org2" boardSlug="board2">
        <TestConsumer />
      </EndUserProvider>
    );
    expect(screen.getByTestId("storageKey").textContent).toBe("enduser_org2_board2");
  });
});

describe("useEndUser", () => {
  it("throws when used outside EndUserProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    function BadConsumer() {
      useEndUser();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow("useEndUser must be used within EndUserProvider");
    spy.mockRestore();
  });
});
