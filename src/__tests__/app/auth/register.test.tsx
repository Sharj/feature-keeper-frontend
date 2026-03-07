import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(auth)/register/page";

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
    register: jest.fn(),
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
const mockRegister = auth.register as jest.Mock;

beforeEach(() => {
  mockPush.mockReset();
  mockLogin.mockReset();
  mockRegister.mockReset();
});

describe("RegisterPage", () => {
  it("renders registration form", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Create Admin Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("submits form and redirects on success", async () => {
    mockRegister.mockResolvedValueOnce({
      data: { user: { id: 1, name: "New User", email: "new@test.com" } },
      token: "new-token",
    });

    render(<RegisterPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "New User");
    await user.type(screen.getByLabelText("Email"), "new@test.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, name: "New User", email: "new@test.com" },
        "new-token"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error when no token returned", async () => {
    mockRegister.mockResolvedValueOnce({
      data: { user: { id: 1, name: "X", email: "x@y.z" } },
    });

    render(<RegisterPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "X");
    await user.type(screen.getByLabelText("Email"), "x@y.z");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(screen.getByText("No token received from server.")).toBeInTheDocument();
    });
  });

  it("shows API error", async () => {
    mockRegister.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(422, "Email taken")
    );

    render(<RegisterPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "X");
    await user.type(screen.getByLabelText("Email"), "taken@test.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(screen.getByText("Email taken")).toBeInTheDocument();
    });
  });

  it("shows generic error on non-ApiError", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Network error"));

    render(<RegisterPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "X");
    await user.type(screen.getByLabelText("Email"), "x@y.z");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    let resolveRegister: (v: unknown) => void;
    mockRegister.mockReturnValueOnce(new Promise((resolve) => { resolveRegister = resolve; }));

    render(<RegisterPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Name"), "X");
    await user.type(screen.getByLabelText("Email"), "x@y.z");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByText("Create Account"));

    expect(screen.getByText("Creating account...")).toBeInTheDocument();

    resolveRegister!({ data: { user: { id: 1, name: "X", email: "x@y.z" } }, token: "t" });
    await waitFor(() => {
      expect(screen.queryByText("Creating account...")).not.toBeInTheDocument();
    });
  });
});
