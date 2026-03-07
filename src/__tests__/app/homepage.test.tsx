import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

describe("HomePage", () => {
  it("renders the hero section", () => {
    render(<HomePage />);
    expect(screen.getAllByText("Feature Keeper").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Turn user feedback into/)).toBeInTheDocument();
  });

  it("has navigation links", () => {
    render(<HomePage />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Get started free")).toBeInTheDocument();
  });

  it("renders the features section", () => {
    render(<HomePage />);
    expect(screen.getByText("Public feedback boards")).toBeInTheDocument();
    expect(screen.getByText("Voting & prioritization")).toBeInTheDocument();
    expect(screen.getByText("Threaded comments")).toBeInTheDocument();
    expect(screen.getByText("Statuses & categories")).toBeInTheDocument();
    expect(screen.getByText("Team collaboration")).toBeInTheDocument();
    expect(screen.getByText("Flexible authentication")).toBeInTheDocument();
  });

  it("renders the how it works section", () => {
    render(<HomePage />);
    expect(screen.getByText("Up and running in minutes")).toBeInTheDocument();
    expect(screen.getByText("Create your board")).toBeInTheDocument();
    expect(screen.getByText("Collect & prioritize")).toBeInTheDocument();
    expect(screen.getByText("Ship & communicate")).toBeInTheDocument();
  });

  it("renders the CTA section", () => {
    render(<HomePage />);
    expect(screen.getByText("Start building what users want")).toBeInTheDocument();
    expect(screen.getByText("Get started for free")).toBeInTheDocument();
  });

  it("renders the mock board preview", () => {
    render(<HomePage />);
    expect(screen.getByText("Dark mode support")).toBeInTheDocument();
    expect(screen.getByText("CSV export for reports")).toBeInTheDocument();
    expect(screen.getByText("Slack integration")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(<HomePage />);
    expect(screen.getByText("Built for teams that listen to their users.")).toBeInTheDocument();
  });

  it("links to register page", () => {
    render(<HomePage />);
    const registerLinks = screen.getAllByText(/Get started/);
    expect(registerLinks.length).toBeGreaterThan(0);
    registerLinks.forEach((link) => {
      expect(link.closest("a")).toHaveAttribute("href", "/register");
    });
  });

  it("links to login page", () => {
    render(<HomePage />);
    const signInLink = screen.getByText("Sign in");
    expect(signInLink.closest("a")).toHaveAttribute("href", "/login");
  });
});
