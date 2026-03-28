import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { ApiError } from "@/lib/api";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/login",
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
});

// Mock auth context
const mockLogin = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    token: null,
    isLoading: false,
  }),
}));

// Mock API
const mockAuthLogin = jest.fn();
jest.mock("@/lib/api", () => ({
  auth: { login: (...args: unknown[]) => mockAuthLogin(...args) },
  ApiError: class ApiError extends Error {
    status: number;
    errors: string[];
    constructor(status: number, message: string, errors: string[] = []) {
      super(message);
      this.status = status;
      this.errors = errors;
    }
  },
}));

beforeEach(() => {
  mockPush.mockReset();
  mockLogin.mockReset();
  mockAuthLogin.mockReset();
});

describe("LoginPage", () => {
  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error on failed login", async () => {
    const user = userEvent.setup();
    const { ApiError: MockApiError } = require("@/lib/api");
    mockAuthLogin.mockRejectedValue(new MockApiError(401, "Invalid credentials"));

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "t@t.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("calls auth.login API on submit", async () => {
    const user = userEvent.setup();
    mockAuthLogin.mockResolvedValue({
      data: { user: { id: 1, name: "Test", email: "t@t.com" }, has_subscription: true, project_count: 1 },
      token: "tok",
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "t@t.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith({ email: "t@t.com", password: "pass123" });
    });
  });

  it("redirects to /dashboard on success with projects", async () => {
    const user = userEvent.setup();
    mockAuthLogin.mockResolvedValue({
      data: { user: { id: 1, name: "Test", email: "t@t.com" }, has_subscription: true, project_count: 2 },
      token: "tok",
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "t@t.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to /dashboard/projects/new on success with no projects", async () => {
    const user = userEvent.setup();
    mockAuthLogin.mockResolvedValue({
      data: { user: { id: 1, name: "Test", email: "t@t.com" }, has_subscription: true, project_count: 0 },
      token: "tok",
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "t@t.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/projects/new");
    });
  });

  it("redirects to /dashboard/choose-plan on success with no subscription", async () => {
    const user = userEvent.setup();
    mockAuthLogin.mockResolvedValue({
      data: { user: { id: 1, name: "Test", email: "t@t.com" }, has_subscription: false, project_count: 0 },
      token: "tok",
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "t@t.com");
    await user.type(screen.getByLabelText("Password"), "pass123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/choose-plan");
    });
  });
});
