import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PublicBoardPage from "@/app/o/[orgSlug]/b/[boardSlug]/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ orgSlug: "acme", boardSlug: "features" }),
}));

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

const mockSetEndUser = jest.fn();
const mockClearEndUser = jest.fn();
let endUserState = { endUserId: null as number | null, name: null as string | null, email: null as string | null };

jest.mock("@/contexts/EndUserContext", () => ({
  useEndUser: () => ({
    ...endUserState,
    setEndUser: mockSetEndUser,
    clearEndUser: mockClearEndUser,
    storageKey: "enduser_acme_features",
  }),
}));

// Mock EndUserAuthModal as a simple div
jest.mock("@/components/public/EndUserAuthModal", () => {
  return function MockModal({ open }: { open: boolean }) {
    return open ? <div data-testid="auth-modal">Auth Modal</div> : null;
  };
});

jest.mock("@/lib/api", () => ({
  publicBoard: {
    get: jest.fn(),
    ideas: jest.fn(),
    vote: jest.fn(),
    createIdea: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { publicBoard, ApiError } from "@/lib/api";
const mockBoardGet = publicBoard.get as jest.Mock;
const mockIdeas = publicBoard.ideas as jest.Mock;
const mockVote = publicBoard.vote as jest.Mock;
const mockCreateIdea = publicBoard.createIdea as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  endUserState = { endUserId: null, name: null, email: null };
});

function setupBoard() {
  mockBoardGet.mockResolvedValueOnce({
    data: {
      id: 1, name: "Features", slug: "features", description: "Share ideas",
      statuses: [{ id: 1, name: "Open", color: "#22c55e", position: 0 }],
      categories: [{ id: 1, name: "UX", color: "#3b82f6", position: 0 }],
      auth_mode: "email_only",
    },
  });
  mockIdeas.mockResolvedValueOnce({
    data: {
      ideas: [
        {
          id: 10, title: "Dark mode", description: "Add dark mode support",
          votes_count: 12, comments_count: 3,
          status: { id: 1, name: "Open", color: "#22c55e" },
          category: { id: 1, name: "UX", color: "#3b82f6" },
          author: { id: 1, name: "Jane" },
          created_at: "2024-01-01",
        },
      ],
      meta: { page: 1, per_page: 20, total: 1, total_pages: 1 },
    },
  });
}

describe("PublicBoardPage", () => {
  it("renders board and ideas", async () => {
    setupBoard();
    render(<PublicBoardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dark mode")).toBeInTheDocument();
    });
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Share ideas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3 comments")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("shows sign in prompt when not authenticated", async () => {
    setupBoard();
    render(<PublicBoardPage />);

    await waitFor(() => {
      expect(screen.getByText("Sign in to vote & submit ideas")).toBeInTheDocument();
    });
  });

  it("shows user name when authenticated", async () => {
    endUserState = { endUserId: 1, name: "Jane", email: "j@t.co" };
    setupBoard();
    render(<PublicBoardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
    });
  });

  it("opens auth modal when voting without auth", async () => {
    setupBoard();
    render(<PublicBoardPage />);

    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12")); // Vote button

    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });

  it("votes when authenticated", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();
    mockVote.mockResolvedValueOnce({ data: { voted: true, votes_count: 13 } });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("12"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12"));

    await waitFor(() => {
      expect(mockVote).toHaveBeenCalledWith("acme", "features", 10, 5);
      expect(screen.getByText("13")).toBeInTheDocument();
    });
  });

  it("opens auth modal when submitting idea without auth", async () => {
    setupBoard();
    render(<PublicBoardPage />);

    await waitFor(() => screen.getByText("Submit Idea"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Submit Idea"));

    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });

  it("shows idea form when authenticated and Submit Idea clicked", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Submit Idea"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Submit Idea"));

    expect(screen.getByText("Submit a New Idea")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your idea title...")).toBeInTheDocument();
  });

  it("submits a new idea", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();
    mockCreateIdea.mockResolvedValueOnce({ data: { id: 11, title: "New" } });
    // The reload after submission
    mockIdeas.mockResolvedValueOnce({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Submit Idea"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Submit Idea"));
    await user.type(screen.getByPlaceholderText("Your idea title..."), "New Idea");
    await user.type(screen.getByPlaceholderText("Describe your idea..."), "Description");
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockCreateIdea).toHaveBeenCalledWith("acme", "features", {
        idea: { title: "New Idea", description: "Description" },
        end_user_id: 5,
      });
    });
  });

  it("shows empty state when no ideas", async () => {
    mockBoardGet.mockResolvedValueOnce({
      data: { id: 1, name: "Empty", slug: "empty", statuses: [], categories: [], auth_mode: "email_only" },
    });
    mockIdeas.mockResolvedValueOnce({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);

    await waitFor(() => {
      expect(screen.getByText("No ideas yet.")).toBeInTheDocument();
    });
  });

  it("shows error when board not found", async () => {
    mockBoardGet.mockRejectedValueOnce(new Error("Not found"));

    render(<PublicBoardPage />);

    await waitFor(() => {
      expect(screen.getByText("Board not found")).toBeInTheDocument();
    });
  });

  it("shows pagination when multiple pages", async () => {
    mockBoardGet.mockResolvedValueOnce({
      data: { id: 1, name: "Board", slug: "board", statuses: [], categories: [], auth_mode: "email_only" },
    });
    mockIdeas.mockResolvedValueOnce({
      data: {
        ideas: [{ id: 1, title: "Idea 1", description: "", votes_count: 1, comments_count: 0, status: null, category: null, author: { id: 1, name: "X" }, created_at: "2024-01-01" }],
        meta: { page: 1, per_page: 20, total: 50, total_pages: 3 },
      },
    });

    render(<PublicBoardPage />);

    await waitFor(() => {
      expect(screen.getByText("Idea 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeDisabled();
    expect(screen.getByText("Next")).not.toBeDisabled();
  });

  it("handles vote auth error by showing modal", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();
    mockVote.mockRejectedValueOnce(new (ApiError as unknown as new (s: number, m: string) => Error)(401, "Unauthorized"));

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("12"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    });
  });

  it("clears end user on sign out click", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText(/Jane/));

    const user = userEvent.setup();
    await user.click(screen.getByText("Sign out"));

    expect(mockClearEndUser).toHaveBeenCalled();
  });

  it("filters by status", async () => {
    setupBoard();
    // Second call after filter change
    mockIdeas.mockResolvedValueOnce({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    const statusSelect = screen.getByDisplayValue("All Statuses");
    await user.selectOptions(statusSelect, "1");

    await waitFor(() => {
      // mockIdeas called with status_id param
      const calls = mockIdeas.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[2]).toEqual(expect.objectContaining({ status_id: "1" }));
    });
  });

  it("filters by category", async () => {
    setupBoard();
    mockIdeas.mockResolvedValueOnce({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    const catSelect = screen.getByDisplayValue("All Categories");
    await user.selectOptions(catSelect, "1");

    await waitFor(() => {
      const calls = mockIdeas.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[2]).toEqual(expect.objectContaining({ category_id: "1" }));
    });
  });

  it("sorts by votes", async () => {
    setupBoard();
    mockIdeas.mockResolvedValueOnce({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    const sortSelect = screen.getByDisplayValue("Most Recent");
    await user.selectOptions(sortSelect, "votes");

    await waitFor(() => {
      const calls = mockIdeas.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[2]).toEqual(expect.objectContaining({ sort: "votes" }));
    });
  });

  it("searches ideas", async () => {
    setupBoard();
    // Use mockResolvedValue (not Once) because typing triggers multiple re-renders
    mockIdeas.mockResolvedValue({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Search ideas..."), "dark");

    await waitFor(() => {
      const calls = mockIdeas.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[2]).toEqual(expect.objectContaining({ q: "dark" }));
    });
  });

  it("submits idea with category", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();
    mockCreateIdea.mockResolvedValueOnce({ data: { id: 11, title: "New" } });
    mockIdeas.mockResolvedValueOnce({
      data: { ideas: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 1 } },
    });

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Submit Idea"));
    await user.type(screen.getByPlaceholderText("Your idea title..."), "Idea with cat");
    await user.type(screen.getByPlaceholderText("Describe your idea..."), "Desc");

    // Select category
    const catSelect = screen.getByDisplayValue("No category");
    await user.selectOptions(catSelect, "1");

    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockCreateIdea).toHaveBeenCalledWith("acme", "features", {
        idea: { title: "Idea with cat", description: "Desc", category_id: 1 },
        end_user_id: 5,
      });
    });
  });

  it("cancels idea submission", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Submit Idea"));
    expect(screen.getByText("Submit a New Idea")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Submit a New Idea")).not.toBeInTheDocument();
  });

  it("shows error on non-auth vote failure", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();
    mockVote.mockRejectedValueOnce(new (ApiError as unknown as new (s: number, m: string) => Error)(500, "Server error"));

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("12"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows error on idea creation auth failure", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupBoard();
    mockCreateIdea.mockRejectedValueOnce(new (ApiError as unknown as new (s: number, m: string) => Error)(401, "Unauthorized"));

    render(<PublicBoardPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Submit Idea"));
    await user.type(screen.getByPlaceholderText("Your idea title..."), "Test");
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    });
  });
});
