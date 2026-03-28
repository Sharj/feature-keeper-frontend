import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(auth)/register/page";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/register",
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
const mockAuthRegister = jest.fn();
jest.mock("@/lib/api", () => ({
  auth: { register: (...args: unknown[]) => mockAuthRegister(...args) },
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
  mockAuthRegister.mockReset();
});

describe("RegisterPage", () => {
  it("renders name, email, and password inputs", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("calls auth.register API on submit", async () => {
    const user = userEvent.setup();
    mockAuthRegister.mockResolvedValue({
      data: { user: { id: 1, name: "New User", email: "new@t.com" }, has_subscription: false, project_count: 0 },
      token: "tok-new",
    });

    render(<RegisterPage />);
    await user.type(screen.getByLabelText("Name"), "New User");
    await user.type(screen.getByLabelText("Email"), "new@t.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockAuthRegister).toHaveBeenCalledWith({ name: "New User", email: "new@t.com", password: "password123" });
    });
  });

  it("redirects to /dashboard/choose-plan after success", async () => {
    const user = userEvent.setup();
    mockAuthRegister.mockResolvedValue({
      data: { user: { id: 1, name: "New User", email: "new@t.com" }, has_subscription: false, project_count: 0 },
      token: "tok-new",
    });

    render(<RegisterPage />);
    await user.type(screen.getByLabelText("Name"), "New User");
    await user.type(screen.getByLabelText("Email"), "new@t.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/choose-plan");
    });
  });

  it("shows error on failed registration", async () => {
    const user = userEvent.setup();
    const { ApiError: MockApiError } = require("@/lib/api");
    mockAuthRegister.mockRejectedValue(new MockApiError(422, "Email has already been taken"));

    render(<RegisterPage />);
    await user.type(screen.getByLabelText("Name"), "New User");
    await user.type(screen.getByLabelText("Email"), "dup@t.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Email has already been taken")).toBeInTheDocument();
    });
  });

  it("calls login with hasSubscription=false and projectCount=0", async () => {
    const user = userEvent.setup();
    mockAuthRegister.mockResolvedValue({
      data: { user: { id: 1, name: "New", email: "n@t.com" }, has_subscription: false, project_count: 0 },
      token: "tok-new",
    });

    render(<RegisterPage />);
    await user.type(screen.getByLabelText("Name"), "New");
    await user.type(screen.getByLabelText("Email"), "n@t.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, name: "New", email: "n@t.com" },
        "tok-new",
        false,
        0
      );
    });
  });
});
