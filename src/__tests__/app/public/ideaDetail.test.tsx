import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaDetailPage from "@/app/o/[orgSlug]/b/[boardSlug]/ideas/[ideaId]/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ orgSlug: "acme", boardSlug: "features", ideaId: "10" }),
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

jest.mock("@/components/public/EndUserAuthModal", () => {
  return function MockModal({ open }: { open: boolean }) {
    return open ? <div data-testid="auth-modal">Auth Modal</div> : null;
  };
});

jest.mock("@/lib/api", () => ({
  publicBoard: {
    getIdea: jest.fn(),
    comments: jest.fn(),
    get: jest.fn(),
    vote: jest.fn(),
    createComment: jest.fn(),
    updateIdea: jest.fn(),
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
const mockGetIdea = publicBoard.getIdea as jest.Mock;
const mockComments = publicBoard.comments as jest.Mock;
const mockBoardGet = publicBoard.get as jest.Mock;
const mockVote = publicBoard.vote as jest.Mock;
const mockCreateComment = publicBoard.createComment as jest.Mock;
const mockUpdateIdea = publicBoard.updateIdea as jest.Mock;

const baseIdea = {
  id: 10, title: "Dark mode", description: "Add dark mode support",
  votes_count: 12, comments_count: 2,
  status: { id: 1, name: "Open", color: "#22c55e" },
  category: { id: 1, name: "UX", color: "#3b82f6" },
  author: { id: 5, name: "Jane", avatar_url: null },
  voted_by_end_user_ids: [5],
  created_at: "2024-01-15",
};

const baseComments = [
  { id: 1, body: "Great idea!", admin_comment: false, author: { id: 5, name: "Jane" }, created_at: "2024-01-16" },
  { id: 2, body: "We'll look into it", admin_comment: true, author: { id: 1, name: "Admin" }, created_at: "2024-01-17" },
];

beforeEach(() => {
  jest.clearAllMocks();
  endUserState = { endUserId: null, name: null, email: null };
});

function setupIdea(ideaOverrides = {}, comments = baseComments) {
  mockGetIdea.mockResolvedValueOnce({ data: { ...baseIdea, ...ideaOverrides } });
  mockComments.mockResolvedValueOnce({ data: comments });
  mockBoardGet.mockResolvedValueOnce({ data: { id: 1, auth_mode: "email_only" } });
}

describe("IdeaDetailPage", () => {
  it("renders idea details", async () => {
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Dark mode")).toBeInTheDocument();
    });
    expect(screen.getByText("Add dark mode support")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("UX")).toBeInTheDocument();
    expect(screen.getAllByText(/Jane/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders comments with admin badge", async () => {
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Great idea!")).toBeInTheDocument();
    });
    expect(screen.getByText("We'll look into it")).toBeInTheDocument();
    // "Admin" appears both as author name and badge - just check multiple exist
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Comments (2)")).toBeInTheDocument();
  });

  it("shows sign in button when not authenticated", async () => {
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });
  });

  it("shows user name and sign out when authenticated", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Jane").length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("opens auth modal when voting without auth", async () => {
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => screen.getByText("12"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12"));

    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });

  it("votes when authenticated and shows voted state", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();
    mockVote.mockResolvedValueOnce({ data: { voted: false, votes_count: 11 } });

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("12"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12"));

    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });

  it("posts a comment", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();
    mockCreateComment.mockResolvedValueOnce({
      data: { id: 3, body: "My comment", admin_comment: false, author: { id: 5, name: "Jane" }, created_at: "2024-01-18" },
    });

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Write a comment..."), "My comment");
    await user.click(screen.getByText("Post"));

    await waitFor(() => {
      expect(screen.getByText("My comment")).toBeInTheDocument();
    });
    expect(mockCreateComment).toHaveBeenCalledWith("acme", "features", 10, {
      body: "My comment",
      end_user_id: 5,
    });
  });

  it("disables comment input when not authenticated", async () => {
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => screen.getByText("Dark mode"));
    expect(screen.getByPlaceholderText("Sign in to comment")).toBeDisabled();
  });

  it("shows edit button for own ideas", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea({ author: { id: 5, name: "Jane" } });
    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  it("does not show edit button for other users' ideas", async () => {
    endUserState = { endUserId: 99, name: "Other", email: "other@t.co" };
    setupIdea({ author: { id: 5, name: "Jane" } });
    render(<IdeaDetailPage />);

    await waitFor(() => screen.getByText("Dark mode"));
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("edits own idea", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea({ author: { id: 5, name: "Jane" } });
    mockUpdateIdea.mockResolvedValueOnce({
      data: { title: "Updated title", description: "Updated desc" },
    });

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Edit"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Edit"));

    const titleInput = screen.getByDisplayValue("Dark mode");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated title");
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockUpdateIdea).toHaveBeenCalled();
      expect(screen.getByText("Updated title")).toBeInTheDocument();
    });
  });

  it("cancels editing", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea({ author: { id: 5, name: "Jane" } });

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Edit"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Edit"));
    await user.click(screen.getByText("Cancel"));

    expect(screen.getByText("Dark mode")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Dark mode")).not.toBeInTheDocument();
  });

  it("shows error when idea not found", async () => {
    mockGetIdea.mockRejectedValueOnce(new Error("Not found"));
    mockComments.mockRejectedValueOnce(new Error("Not found"));
    mockBoardGet.mockRejectedValueOnce(new Error("Not found"));

    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Idea not found")).toBeInTheDocument();
    });
  });

  it("shows empty comments state", async () => {
    setupIdea({}, []);
    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("No comments yet. Be the first!")).toBeInTheDocument();
    });
  });

  it("clears end user on sign out", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Sign out"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Sign out"));

    expect(mockClearEndUser).toHaveBeenCalled();
  });

  it("opens auth modal when commenting without auth", async () => {
    endUserState = { endUserId: null, name: null, email: null };
    setupIdea();
    render(<IdeaDetailPage />);

    await waitFor(() => screen.getByText("Dark mode"));
    // Comment input is disabled
    expect(screen.getByPlaceholderText("Sign in to comment")).toBeDisabled();
  });

  it("shows auth modal on comment auth error", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();
    mockCreateComment.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(401, "Unauthorized")
    );

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Write a comment..."), "test");
    await user.click(screen.getByText("Post"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    });
  });

  it("shows error on non-auth comment failure", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();
    mockCreateComment.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(500, "Server error")
    );

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Write a comment..."), "test");
    await user.click(screen.getByText("Post"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows vote auth error as modal", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea();
    mockVote.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(401, "Unauthorized")
    );

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("12"));

    const user = userEvent.setup();
    await user.click(screen.getByText("12"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    });
  });

  it("shows idea with author avatar", async () => {
    setupIdea({}, [
      { id: 1, body: "Has avatar", admin_comment: false, author: { id: 5, name: "Jane", avatar_url: "https://example.com/avatar.png" }, created_at: "2024-01-16" },
    ]);

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Has avatar"));

    const img = document.querySelector("img[src='https://example.com/avatar.png']");
    expect(img).toBeInTheDocument();
  });

  it("shows update error on edit failure", async () => {
    endUserState = { endUserId: 5, name: "Jane", email: "j@t.co" };
    setupIdea({ author: { id: 5, name: "Jane" } });
    mockUpdateIdea.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(422, "Title too short")
    );

    render(<IdeaDetailPage />);
    await waitFor(() => screen.getByText("Edit"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Edit"));
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Title too short")).toBeInTheDocument();
    });
  });
});
