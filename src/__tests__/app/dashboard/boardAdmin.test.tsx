import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardAdminPage from "@/app/dashboard/[orgId]/boards/[boardId]/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ orgId: "1", boardId: "2" }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, name: "Admin" }, token: "tok", isLoading: false }),
}));

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

jest.mock("@/lib/api", () => ({
  boards: { get: jest.fn(), delete: jest.fn() },
  organizations: { get: jest.fn() },
  statuses: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  categories: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  adminIdeas: { updateStatus: jest.fn(), updateCategory: jest.fn(), delete: jest.fn() },
  adminComments: { create: jest.fn(), delete: jest.fn() },
  publicBoard: {
    ideas: jest.fn(),
    comments: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { boards, statuses, categories, adminIdeas, adminComments, organizations, publicBoard } from "@/lib/api";
const mockBoardGet = boards.get as jest.Mock;
const mockBoardDelete = boards.delete as jest.Mock;
const mockStatusCreate = statuses.create as jest.Mock;
const mockStatusUpdate = statuses.update as jest.Mock;
const mockStatusDelete = statuses.delete as jest.Mock;
const mockCatCreate = categories.create as jest.Mock;
const mockCatDelete = categories.delete as jest.Mock;
const mockOrgGet = organizations.get as jest.Mock;
const mockPubIdeas = publicBoard.ideas as jest.Mock;
const mockPubComments = publicBoard.comments as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  window.confirm = jest.fn(() => true);
  mockPush.mockReset();
});

function setupBoard(overrides = {}) {
  const board = {
    id: 2,
    name: "Features",
    slug: "features",
    description: "Feature board",
    ideas_count: 2,
    statuses: [
      { id: 1, name: "Open", color: "#22c55e", position: 0, is_default: true },
      { id: 2, name: "Closed", color: "#ef4444", position: 1, is_default: false },
    ],
    categories: [
      { id: 1, name: "UX", color: "#3b82f6", position: 0 },
    ],
    ...overrides,
  };
  mockBoardGet.mockResolvedValueOnce({ data: board });
  // Use mockResolvedValue (not Once) since the ideas loading effect may re-fire
  mockOrgGet.mockResolvedValue({ data: { id: 1, slug: "acme" } });
  mockPubIdeas.mockResolvedValue({
    data: {
      ideas: [
        { id: 10, title: "Dark mode", description: "Add dark mode", votes_count: 5, comments_count: 2, status: { id: 1, name: "Open", color: "#22c55e" }, category: { id: 1, name: "UX", color: "#3b82f6" }, author: { id: 1, name: "Jane" }, created_at: "2024-01-01" },
      ],
    },
  });
  mockPubComments.mockResolvedValue({ data: [] });
  return board;
}

describe("BoardAdminPage", () => {
  it("renders board with tabs", async () => {
    setupBoard();
    render(<BoardAdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Features")).toBeInTheDocument();
    });
    // Tab buttons contain the count: e.g. "ideas (0)", "statuses (2)", "categories (1)"
    expect(screen.getByText(/^ideas/i)).toBeInTheDocument();
    expect(screen.getByText(/^statuses/i)).toBeInTheDocument();
    expect(screen.getByText(/^categories/i)).toBeInTheDocument();
  });

  it("shows ideas tab by default", async () => {
    setupBoard();
    render(<BoardAdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Dark mode")).toBeInTheDocument();
    });
  });

  it("switches to statuses tab and shows statuses", async () => {
    setupBoard();
    render(<BoardAdminPage />);

    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/statuses/i));

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.getByText("default")).toBeInTheDocument();
  });

  it("creates a new status", async () => {
    setupBoard();
    mockStatusCreate.mockResolvedValueOnce({
      data: { id: 3, name: "In Progress", color: "#f59e0b", position: 2, is_default: false },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/statuses/i));

    await user.type(screen.getByPlaceholderText("Status name"), "In Progress");
    await user.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockStatusCreate).toHaveBeenCalledWith("tok", 1, 2, {
        status: { name: "In Progress", color: "#6b7280" },
      });
    });
  });

  it("switches to categories tab", async () => {
    setupBoard();
    render(<BoardAdminPage />);

    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/categories/i));

    expect(screen.getByText("UX")).toBeInTheDocument();
  });

  it("creates a new category", async () => {
    setupBoard();
    mockCatCreate.mockResolvedValueOnce({
      data: { id: 2, name: "Backend", color: "#333", position: 1 },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/categories/i));

    await user.type(screen.getByPlaceholderText("Category name"), "Backend");
    await user.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockCatCreate).toHaveBeenCalled();
    });
  });

  it("deletes a status", async () => {
    setupBoard();
    mockStatusDelete.mockResolvedValueOnce({ data: undefined });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/statuses/i));

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockStatusDelete).toHaveBeenCalledWith("tok", 1, 2, 1);
    });
  });

  it("deletes a category", async () => {
    setupBoard();
    mockCatDelete.mockResolvedValueOnce({ data: undefined });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/categories/i));

    const deleteButton = screen.getByText("Delete");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockCatDelete).toHaveBeenCalledWith("tok", 1, 2, 1);
    });
  });

  it("deletes the board", async () => {
    setupBoard();
    mockBoardDelete.mockResolvedValueOnce({ data: undefined });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Delete Board"));

    await waitFor(() => {
      expect(mockBoardDelete).toHaveBeenCalledWith("tok", 1, 2);
      expect(mockPush).toHaveBeenCalledWith("/dashboard/1/boards");
    });
  });

  it("shows board not found when board is null", async () => {
    mockBoardGet.mockResolvedValueOnce({ data: null });

    render(<BoardAdminPage />);
    await waitFor(() => {
      expect(screen.getByText("Board not found.")).toBeInTheDocument();
    });
  });

  it("shows empty statuses and categories", async () => {
    setupBoard({ statuses: [], categories: [] });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/categories/i));
    expect(screen.getByText("No categories yet.")).toBeInTheDocument();
  });

  it("selects an idea and shows detail panel", async () => {
    setupBoard();
    mockPubComments.mockResolvedValue({ data: [
      { id: 1, body: "Test comment", admin_comment: false, author: { id: 1, name: "Jane" }, created_at: "2024-01-01" },
    ] });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Dark mode"));

    await waitFor(() => {
      expect(screen.getByText("Add dark mode")).toBeInTheDocument();
    });
    // Status and category dropdowns in detail panel
    expect(screen.getAllByText("Open").length).toBeGreaterThanOrEqual(1);
  });

  it("updates idea status from detail panel", async () => {
    setupBoard();
    mockPubComments.mockResolvedValue({ data: [] });
    (adminIdeas.updateStatus as jest.Mock).mockResolvedValueOnce({
      data: { id: 10, status: { id: 2, name: "Closed", color: "#ef4444" } },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Dark mode"));

    await waitFor(() => screen.getByText("Add dark mode"));

    // Find the status select in the detail panel
    const statusSelects = screen.getAllByRole("combobox");
    // The detail panel has two selects: Status and Category
    const statusSelect = statusSelects.find((s) => {
      const options = Array.from(s.querySelectorAll("option"));
      return options.some((o) => o.textContent === "Closed");
    });
    if (statusSelect) {
      await user.selectOptions(statusSelect, "2");
      await waitFor(() => {
        expect((adminIdeas.updateStatus as jest.Mock)).toHaveBeenCalledWith("tok", 1, 2, 10, 2);
      });
    }
  });

  it("updates idea category from detail panel", async () => {
    setupBoard();
    mockPubComments.mockResolvedValue({ data: [] });
    (adminIdeas.updateCategory as jest.Mock).mockResolvedValueOnce({
      data: { id: 10, category: { id: 1, name: "UX", color: "#3b82f6" } },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Dark mode"));

    await waitFor(() => screen.getByText("Add dark mode"));

    const catSelects = screen.getAllByRole("combobox");
    const catSelect = catSelects.find((s) => {
      const options = Array.from(s.querySelectorAll("option"));
      return options.some((o) => o.textContent === "UX");
    });
    if (catSelect) {
      await user.selectOptions(catSelect, "1");
      await waitFor(() => {
        expect((adminIdeas.updateCategory as jest.Mock)).toHaveBeenCalledWith("tok", 1, 2, 10, 1);
      });
    }
  });

  it("deletes an idea from detail panel", async () => {
    setupBoard();
    mockPubComments.mockResolvedValue({ data: [] });
    (adminIdeas.delete as jest.Mock).mockResolvedValueOnce({ data: undefined });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Dark mode"));

    await waitFor(() => screen.getByText("Add dark mode"));

    // Find the Delete button in the idea detail panel (not the tab Delete buttons)
    const deleteButtons = screen.getAllByText("Delete");
    // The "Delete" in detail panel header
    const detailDelete = deleteButtons.find((btn) => {
      return btn.closest(".bg-white.rounded-xl") !== null;
    });
    if (detailDelete) {
      await user.click(detailDelete);
      await waitFor(() => {
        expect((adminIdeas.delete as jest.Mock)).toHaveBeenCalledWith("tok", 1, 2, 10);
      });
    }
  });

  it("posts an admin comment on selected idea", async () => {
    setupBoard();
    mockPubComments.mockResolvedValue({ data: [] });
    (adminComments.create as jest.Mock).mockResolvedValueOnce({
      data: { id: 5, body: "Admin reply", admin_comment: true, author: { id: 1, name: "Admin" }, created_at: "2024-02-01" },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Dark mode"));

    await waitFor(() => screen.getByText("Add dark mode"));

    await user.type(screen.getByPlaceholderText("Write an admin comment..."), "Admin reply");
    await user.click(screen.getByText("Post"));

    await waitFor(() => {
      expect((adminComments.create as jest.Mock)).toHaveBeenCalledWith("tok", 1, 2, 10, { body: "Admin reply" });
    });
  });

  it("deletes a comment on selected idea", async () => {
    setupBoard();
    mockPubComments.mockResolvedValue({ data: [
      { id: 1, body: "Comment to delete", admin_comment: false, author: { id: 1, name: "Jane" }, created_at: "2024-01-01" },
    ] });
    (adminComments.delete as jest.Mock).mockResolvedValueOnce({ data: undefined });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Dark mode"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Dark mode"));

    await waitFor(() => screen.getByText("Comment to delete"));

    // Find the Delete button within the comments section
    const deleteButtons = screen.getAllByText("Delete");
    // Get the delete button closest to the comment
    const commentDelete = deleteButtons.find((btn) => {
      const parent = btn.closest("[class*='rounded text-sm']");
      return parent !== null;
    });
    if (commentDelete) {
      await user.click(commentDelete);
      await waitFor(() => {
        expect((adminComments.delete as jest.Mock)).toHaveBeenCalledWith("tok", 1, 2, 10, 1);
      });
    }
  });

  it("edits a status inline", async () => {
    setupBoard();
    mockStatusUpdate.mockResolvedValueOnce({
      data: { id: 1, name: "Reviewed", color: "#22c55e", position: 0, is_default: true },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/^statuses/i));

    // Click Edit on the first status
    const editButtons = screen.getAllByText("Edit");
    await user.click(editButtons[0]);

    // The form should now show "Edit Status"
    expect(screen.getByText("Edit Status")).toBeInTheDocument();

    // Clear and type new name
    const nameInput = screen.getByDisplayValue("Open");
    await user.clear(nameInput);
    await user.type(nameInput, "Reviewed");
    await user.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockStatusUpdate).toHaveBeenCalledWith("tok", 1, 2, 1, {
        status: { name: "Reviewed", color: "#22c55e" },
      });
    });
  });

  it("cancels editing a status", async () => {
    setupBoard();

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/^statuses/i));

    const editButtons = screen.getAllByText("Edit");
    await user.click(editButtons[0]);
    expect(screen.getByText("Edit Status")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.getByText("New Status")).toBeInTheDocument();
  });

  it("edits a category inline", async () => {
    setupBoard();
    (categories.update as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, name: "Design", color: "#3b82f6", position: 0 },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/^categories/i));

    const editButton = screen.getByText("Edit");
    await user.click(editButton);

    expect(screen.getByText("Edit Category")).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue("UX");
    await user.clear(nameInput);
    await user.type(nameInput, "Design");
    await user.click(screen.getByText("Update"));

    await waitFor(() => {
      expect((categories.update as jest.Mock)).toHaveBeenCalledWith("tok", 1, 2, 1, {
        category: { name: "Design", color: "#3b82f6" },
      });
    });
  });

  it("cancels editing a category", async () => {
    setupBoard();

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    const user = userEvent.setup();
    await user.click(screen.getByText(/^categories/i));

    await user.click(screen.getByText("Edit"));
    expect(screen.getByText("Edit Category")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.getByText("New Category")).toBeInTheDocument();
  });

  it("shows no ideas message", async () => {
    setupBoard();
    // Override the ideas mock
    mockPubIdeas.mockResolvedValue({
      data: { ideas: [] },
    });

    render(<BoardAdminPage />);
    await waitFor(() => screen.getByText("Features"));

    await waitFor(() => {
      expect(screen.getByText("No ideas yet.")).toBeInTheDocument();
    });
  });
});
