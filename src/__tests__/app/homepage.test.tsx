import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
});

describe("HomePage", () => {
  it("renders the hero heading", () => {
    render(<HomePage />);
    expect(screen.getByText(/Know what your users/i)).toBeInTheDocument();
    expect(screen.getByText(/actually want/i)).toBeInTheDocument();
  });

  it("renders pricing section with Free and Pro plans", () => {
    render(<HomePage />);
    expect(screen.getByText("Simple pricing")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Get Started Free")).toBeInTheDocument();
    expect(screen.getByText("Start with Pro")).toBeInTheDocument();
  });

  it("has links to /register and /login", () => {
    render(<HomePage />);
    const registerLinks = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === "/register");
    const loginLinks = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === "/login");
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it("renders feature sections", () => {
    render(<HomePage />);
    expect(screen.getByText("Topic tags")).toBeInTheDocument();
    expect(screen.getByText("Upvoting")).toBeInTheDocument();
    expect(screen.getByText("Public roadmap")).toBeInTheDocument();
    expect(screen.getByText("Instant setup")).toBeInTheDocument();
  });
});
