import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { ProjectProvider, useProject } from "@/contexts/ProjectContext";

// Mock AuthContext
const mockToken = { current: "test-token" as string | null };
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: mockToken.current }),
}));

// Mock API
const mockProjectsList = jest.fn();
jest.mock("@/lib/api", () => ({
  projects: {
    list: (...args: unknown[]) => mockProjectsList(...args),
  },
}));

const project1 = {
  id: 1, name: "Project A", slug: "proj-a", accent_color: "#c2410c",
  website_url: null, require_approval: false, ideas_count: 3, created_at: "2025-01-01",
  plan: { id: 1, name: "Free", slug: "free", max_ideas: 5, max_seats: 1, max_projects: 1 },
  statuses: [], topics: [], update_tags: [],
};

const project2 = {
  id: 2, name: "Project B", slug: "proj-b", accent_color: "#3b82f6",
  website_url: null, require_approval: false, ideas_count: 0, created_at: "2025-01-02",
  plan: { id: 1, name: "Free", slug: "free", max_ideas: 5, max_seats: 1, max_projects: 1 },
  statuses: [], topics: [], update_tags: [],
};

function TestConsumer() {
  const { currentProject, projects, isLoading, selectProject, refreshProjects } = useProject();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="current">{currentProject?.name ?? "null"}</span>
      <span data-testid="count">{projects.length}</span>
      <button onClick={() => selectProject(2)}>select2</button>
      <button onClick={() => { refreshProjects(); }}>refresh</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  mockProjectsList.mockReset();
  mockToken.current = "test-token";
});

describe("ProjectContext", () => {
  it("fetches projects on mount when token is present", async () => {
    mockProjectsList.mockResolvedValue({ data: [project1] });
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent("Project A"));
    expect(mockProjectsList).toHaveBeenCalledWith("test-token");
  });

  it("does not fetch when token is null", async () => {
    mockToken.current = null;
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    // Wait a tick to ensure any async would have fired
    await act(async () => {});
    expect(mockProjectsList).not.toHaveBeenCalled();
  });

  it("selectProject updates currentProject and localStorage", async () => {
    mockProjectsList.mockResolvedValue({ data: [project1, project2] });
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("2"));

    act(() => {
      screen.getByText("select2").click();
    });

    expect(screen.getByTestId("current")).toHaveTextContent("Project B");
    expect(localStorage.getItem("fk_current_project")).toBe("2");
  });

  it("selects last-used project from localStorage", async () => {
    localStorage.setItem("fk_current_project", "2");
    mockProjectsList.mockResolvedValue({ data: [project1, project2] });
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent("Project B"));
  });

  it("refreshProjects refetches and updates state", async () => {
    mockProjectsList.mockResolvedValue({ data: [project1] });
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent("Project A"));

    mockProjectsList.mockResolvedValue({ data: [project1, project2] });
    await act(async () => {
      screen.getByText("refresh").click();
    });

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("2"));
  });
});
