import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "@/app/dashboard/page";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, name: "Admin" }, token: "tok", isLoading: false }),
}));

jest.mock("@/lib/api", () => ({
  organizations: {
    list: jest.fn(),
    create: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

import { organizations, ApiError } from "@/lib/api";
const mockList = organizations.list as jest.Mock;
const mockCreate = organizations.create as jest.Mock;

beforeEach(() => {
  mockList.mockReset();
  mockCreate.mockReset();
});

describe("DashboardPage", () => {
  it("shows loading state then org list", async () => {
    mockList.mockResolvedValueOnce({
      data: [
        { id: 1, name: "Acme Corp", slug: "acme", plan: { name: "Pro" } },
        { id: 2, name: "Beta Inc", slug: "beta" },
      ],
    });

    render(<DashboardPage />);
    expect(screen.getByText("Loading organizations...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });
    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("shows empty state when no orgs", async () => {
    mockList.mockResolvedValueOnce({ data: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No organizations yet.")).toBeInTheDocument();
    });
  });

  it("creates a new organization", async () => {
    mockList.mockResolvedValueOnce({ data: [] });
    mockCreate.mockResolvedValueOnce({
      data: { id: 3, name: "New Org", slug: "new-org" },
    });

    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("No organizations yet.")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("New Organization"));

    // Fill form
    await user.type(screen.getByPlaceholderText("Acme Corp"), "New Org");
    await user.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(screen.getByText("New Org")).toBeInTheDocument();
    });
    expect(mockCreate).toHaveBeenCalledWith("tok", {
      organization: { name: "New Org", slug: "new-org" },
    });
  });

  it("shows error on create failure", async () => {
    mockList.mockResolvedValueOnce({ data: [] });
    mockCreate.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(422, "Slug taken")
    );

    render(<DashboardPage />);
    await waitFor(() => screen.getByText("No organizations yet."));

    const user = userEvent.setup();
    await user.click(screen.getByText("New Organization"));
    await user.type(screen.getByPlaceholderText("Acme Corp"), "Test");
    await user.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(screen.getByText("Slug taken")).toBeInTheDocument();
    });
  });

  it("handles non-array response gracefully", async () => {
    mockList.mockResolvedValueOnce({ data: null });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No organizations yet.")).toBeInTheDocument();
    });
  });

  it("can cancel create form", async () => {
    mockList.mockResolvedValueOnce({ data: [] });

    render(<DashboardPage />);
    await waitFor(() => screen.getByText("No organizations yet."));

    const user = userEvent.setup();
    await user.click(screen.getByText("New Organization"));
    expect(screen.getByPlaceholderText("Acme Corp")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("Acme Corp")).not.toBeInTheDocument();
  });

  it("uses custom slug when provided", async () => {
    mockList.mockResolvedValueOnce({ data: [] });
    mockCreate.mockResolvedValueOnce({
      data: { id: 3, name: "X", slug: "custom-slug" },
    });

    render(<DashboardPage />);
    await waitFor(() => screen.getByText("No organizations yet."));

    const user = userEvent.setup();
    await user.click(screen.getByText("New Organization"));
    await user.type(screen.getByPlaceholderText("Acme Corp"), "X");
    await user.type(screen.getByPlaceholderText("acme-corp (auto-generated)"), "custom-slug");
    await user.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith("tok", {
        organization: { name: "X", slug: "custom-slug" },
      });
    });
  });
});
