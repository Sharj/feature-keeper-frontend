import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

const mockLogout = jest.fn();
let mockAuth = { user: { id: 1, name: "TestUser" }, token: "tok", isLoading: false, logout: mockLogout };

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

import DashboardLayout from "@/app/dashboard/layout";

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: { id: 1, name: "TestUser" }, token: "tok", isLoading: false, logout: mockLogout };
});

describe("DashboardLayout", () => {
  it("renders children when authenticated", () => {
    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("Feature Keeper")).toBeInTheDocument();
  });

  it("shows loading state when isLoading", () => {
    mockAuth = { user: null, token: null, isLoading: true, logout: mockLogout } as typeof mockAuth;
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("redirects to login when no token and not loading", async () => {
    mockAuth = { user: null, token: null, isLoading: false, logout: mockLogout } as typeof mockAuth;
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("logs out and redirects", async () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Sign out"));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
