import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "@/app/dashboard/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/dashboard",
  useParams: () => ({}),
}));

// Mock contexts
const mockCurrentProject = {
  id: 1,
  name: "Test Project",
  slug: "test",
  accent_color: "#c2410c",
  website_url: null,
  require_approval: false,
  ideas_count: 2,
  created_at: "2025-01-01",
  plan: { id: 1, name: "Free", slug: "free", max_ideas: 5, max_seats: 1, max_projects: 1 },
  statuses: [{ id: 1, name: "Open", color: "#9c968f", position: 0, is_default: true }],
  topics: [{ id: 1, name: "Bug", color: "#ef4444", position: 0 }],
  update_tags: [],
};

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test", email: "t@t.com" },
    token: "test-token",
    hasSubscription: true,
    projectCount: 1,
    isLoading: false,
  }),
}));

jest.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({
    currentProject: mockCurrentProject,
    projects: [mockCurrentProject],
    isLoading: false,
    selectProject: jest.fn(),
    refreshProjects: jest.fn(),
  }),
}));

// Mock API
const mockAdminIdeasList = jest.fn();
const mockAdminIdeasCreate = jest.fn();
jest.mock("@/lib/api", () => ({
  adminIdeas: {
    list: (...args: unknown[]) => mockAdminIdeasList(...args),
    create: (...args: unknown[]) => mockAdminIdeasCreate(...args),
    vote: jest.fn().mockResolvedValue({ data: { voted: true, votes_count: 1 } }),
    comments: jest.fn().mockResolvedValue({ data: [] }),
    updateStatus: jest.fn(),
    updateTopics: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    approve: jest.fn(),
    delete: jest.fn(),
    createComment: jest.fn(),
    deleteComment: jest.fn(),
  },
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

const sampleIdea = {
  id: 10,
  title: "Dark mode support",
  description: "Please add dark mode",
  author_name: "User",
  author_email: "user@t.com",
  source: "public" as const,
  votes_count: 5,
  comments_count: 2,
  voted: false,
  archived: false,
  pending: false,
  published_at: "2025-01-01",
  created_at: "2025-01-01",
  status: { id: 1, name: "Open", color: "#9c968f" },
  topics: [{ id: 1, name: "Bug", color: "#ef4444" }],
};

beforeEach(() => {
  mockAdminIdeasList.mockReset();
  mockAdminIdeasCreate.mockReset();
});

describe("DashboardPage", () => {
  it("renders Ideas heading", async () => {
    mockAdminIdeasList.mockResolvedValue({
      data: { ideas: [sampleIdea], meta: { page: 1, total: 1, total_pages: 1, per_page: 20 } },
    });
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Ideas")).toBeInTheDocument();
    });
  });

  it("shows ideas list when data is loaded", async () => {
    mockAdminIdeasList.mockResolvedValue({
      data: { ideas: [sampleIdea], meta: { page: 1, total: 1, total_pages: 1, per_page: 20 } },
    });
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Dark mode support")).toBeInTheDocument();
    });
  });

  it("shows empty state when no ideas", async () => {
    mockAdminIdeasList.mockResolvedValue({
      data: { ideas: [], meta: { page: 1, total: 0, total_pages: 0, per_page: 20 } },
    });
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("No ideas yet")).toBeInTheDocument();
    });
  });

  it("Add Idea button opens modal", async () => {
    const user = userEvent.setup();
    mockAdminIdeasList.mockResolvedValue({
      data: { ideas: [sampleIdea], meta: { page: 1, total: 1, total_pages: 1, per_page: 20 } },
    });
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dark mode support")).toBeInTheDocument();
    });

    // Find the "+ Add Idea" button in the toolbar (not the empty state one)
    const addButtons = screen.getAllByRole("button", { name: /add idea/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Create a new idea on behalf of your team.")).toBeInTheDocument();
    });
  });
});
