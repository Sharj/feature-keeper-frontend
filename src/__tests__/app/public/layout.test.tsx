import { render, screen } from "@testing-library/react";
import PublicBoardLayout from "@/app/o/[orgSlug]/b/[boardSlug]/layout";

jest.mock("next/navigation", () => ({
  useParams: () => ({ orgSlug: "acme", boardSlug: "features" }),
}));

// Mock EndUserProvider to verify it receives the right props
jest.mock("@/contexts/EndUserContext", () => ({
  EndUserProvider: ({ orgSlug, boardSlug, children }: { orgSlug: string; boardSlug: string; children: React.ReactNode }) => (
    <div data-testid="provider" data-org={orgSlug} data-board={boardSlug}>
      {children}
    </div>
  ),
}));

describe("PublicBoardLayout", () => {
  it("wraps children in EndUserProvider with correct props", () => {
    render(
      <PublicBoardLayout>
        <div>Board Content</div>
      </PublicBoardLayout>
    );

    const provider = screen.getByTestId("provider");
    expect(provider).toHaveAttribute("data-org", "acme");
    expect(provider).toHaveAttribute("data-board", "features");
    expect(screen.getByText("Board Content")).toBeInTheDocument();
  });
});
