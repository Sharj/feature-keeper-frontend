import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogin = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin, user: null, token: null, isLoading: false }),
}));

jest.mock("@/lib/api", () => ({
  auth: {
    login: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { auth, ApiError } from "@/lib/api";
const mockAuthLogin = auth.login as jest.Mock;

beforeEach(() => {
  mockPush.mockReset();
  mockLogin.mockReset();
  mockAuthLogin.mockReset();
});

describe("LoginPage", () => {
  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("submits form and redirects on success", async () => {
    mockAuthLogin.mockResolvedValueOnce({
      data: { user: { id: 1, name: "Admin", email: "admin@test.com" } },
      token: "jwt-token",
    });

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "admin@test.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, name: "Admin", email: "admin@test.com" },
        "jwt-token"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error when no token returned", async () => {
    mockAuthLogin.mockResolvedValueOnce({
      data: { user: { id: 1, name: "Admin", email: "admin@test.com" } },
      // No token
    });

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "admin@test.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("No token received from server.")).toBeInTheDocument();
    });
  });

  it("shows API error message", async () => {
    mockAuthLogin.mockRejectedValueOnce(new (ApiError as unknown as new (s: number, m: string) => Error)(401, "Invalid credentials"));

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "bad@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows generic error on non-ApiError", async () => {
    mockAuthLogin.mockRejectedValueOnce(new Error("Network failure"));

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "a@b.c");
    await user.type(screen.getByLabelText("Password"), "pass");
    await user.click(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    let resolveLogin: (v: unknown) => void;
    mockAuthLogin.mockReturnValueOnce(new Promise((resolve) => { resolveLogin = resolve; }));

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "a@b.c");
    await user.type(screen.getByLabelText("Password"), "pass");
    await user.click(screen.getByText("Sign In"));

    expect(screen.getByText("Signing in...")).toBeInTheDocument();

    resolveLogin!({ data: { user: { id: 1, name: "A", email: "a@b.c" } }, token: "t" });
    await waitFor(() => {
      expect(screen.queryByText("Signing in...")).not.toBeInTheDocument();
    });
  });
});
