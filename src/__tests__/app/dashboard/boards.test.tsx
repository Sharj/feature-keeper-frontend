import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardsPage from "@/app/dashboard/[orgId]/boards/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ orgId: "1" }),
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
  organizations: { get: jest.fn() },
  boards: { list: jest.fn(), create: jest.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { organizations, boards, ApiError } from "@/lib/api";
const mockOrgGet = organizations.get as jest.Mock;
const mockBoardList = boards.list as jest.Mock;
const mockBoardCreate = boards.create as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
});

function setupMocks(boardData: unknown[] = []) {
  mockOrgGet.mockResolvedValueOnce({ data: { id: 1, name: "Acme", slug: "acme" } });
  mockBoardList.mockResolvedValueOnce({ data: boardData });
}

describe("BoardsPage", () => {
  it("renders boards list", async () => {
    setupMocks([
      { id: 1, name: "Features", slug: "features", description: "Feature board", ideas_count: 5 },
      { id: 2, name: "Bugs", slug: "bugs", description: "Bug reports", ideas_count: 3 },
    ]);

    render(<BoardsPage />);

    await waitFor(() => {
      expect(screen.getByText("Features")).toBeInTheDocument();
    });
    expect(screen.getByText("Bugs")).toBeInTheDocument();
    expect(screen.getByText("5 ideas")).toBeInTheDocument();
    expect(screen.getByText("/o/acme/b/features")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    setupMocks([]);
    render(<BoardsPage />);

    await waitFor(() => {
      expect(screen.getByText("No boards yet.")).toBeInTheDocument();
    });
  });

  it("creates a new board", async () => {
    setupMocks([]);
    mockBoardCreate.mockResolvedValueOnce({
      data: { id: 3, name: "Ideas", slug: "ideas", description: "All ideas", ideas_count: 0 },
    });

    render(<BoardsPage />);
    await waitFor(() => screen.getByText("No boards yet."));

    const user = userEvent.setup();
    await user.click(screen.getByText("New Board"));

    await user.type(screen.getByPlaceholderText("Feature Requests"), "Ideas");
    await user.click(screen.getByText("Create Board"));

    await waitFor(() => {
      expect(screen.getByText("Ideas")).toBeInTheDocument();
    });
  });

  it("shows error on create failure", async () => {
    setupMocks([]);
    mockBoardCreate.mockRejectedValueOnce(
      new (ApiError as unknown as new (s: number, m: string) => Error)(422, "Slug taken")
    );

    render(<BoardsPage />);
    await waitFor(() => screen.getByText("No boards yet."));

    const user = userEvent.setup();
    await user.click(screen.getByText("New Board"));
    await user.type(screen.getByPlaceholderText("Feature Requests"), "Test");
    await user.click(screen.getByText("Create Board"));

    await waitFor(() => {
      expect(screen.getByText("Slug taken")).toBeInTheDocument();
    });
  });

  it("can cancel create form", async () => {
    setupMocks([]);
    render(<BoardsPage />);
    await waitFor(() => screen.getByText("No boards yet."));

    const user = userEvent.setup();
    await user.click(screen.getByText("New Board"));
    expect(screen.getByPlaceholderText("Feature Requests")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("Feature Requests")).not.toBeInTheDocument();
  });

  it("handles non-array boards response", async () => {
    mockOrgGet.mockResolvedValueOnce({ data: { id: 1, name: "Acme", slug: "acme" } });
    mockBoardList.mockResolvedValueOnce({ data: null });

    render(<BoardsPage />);

    await waitFor(() => {
      expect(screen.getByText("No boards yet.")).toBeInTheDocument();
    });
  });
});
