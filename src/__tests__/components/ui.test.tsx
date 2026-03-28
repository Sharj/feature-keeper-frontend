import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, Input, Select, Card, Badge, Modal } from "@/components/ui";

describe("Button", () => {
  it("renders with children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button", { name: "Secondary" });
    expect(btn.className).toContain("border");
  });

  it("shows loading spinner and is disabled when loading", () => {
    render(<Button loading>Submit</Button>);
    const btn = screen.getByRole("button", { name: /submit/i });
    expect(btn).toBeDisabled();
    // The spinner is an svg with animate-spin class
    const svg = btn.querySelector("svg.animate-spin");
    expect(svg).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("renders full width when fullWidth is true", () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole("button", { name: "Wide" }).className).toContain("w-full");
  });
});

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Email" error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("shows hint when no error", () => {
    render(<Input label="Password" hint="At least 6 characters" />);
    expect(screen.getByText("At least 6 characters")).toBeInTheDocument();
  });

  it("does not show hint when error is present", () => {
    render(<Input label="Password" hint="At least 6 chars" error="Too short" />);
    expect(screen.getByText("Too short")).toBeInTheDocument();
    expect(screen.queryByText("At least 6 chars")).not.toBeInTheDocument();
  });
});

describe("Select", () => {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  it("renders options", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Select label="Status" options={options} />);
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("shows chevron icon (svg element)", () => {
    const { container } = render(<Select options={options} />);
    const chevronSvg = container.querySelector("svg");
    expect(chevronSvg).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with elevated variant", () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("shadow-md");
  });

  it("renders with interactive variant", () => {
    const { container } = render(<Card variant="interactive">Click me</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("cursor-pointer");
  });
});

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with success variant", () => {
    const { container } = render(<Badge variant="success">Done</Badge>);
    const span = container.firstChild as HTMLElement;
    expect(span.className).toContain("text-positive");
  });

  it("renders with dynamic color", () => {
    const { container } = render(<Badge color="#ff0000">Custom</Badge>);
    const span = container.firstChild as HTMLElement;
    expect(span.style.backgroundColor).toBeTruthy();
    expect(span.style.color).toBe("rgb(255, 0, 0)");
  });

  it("renders dot when dot prop is true", () => {
    const { container } = render(<Badge dot color="#00ff00">With dot</Badge>);
    const dotSpan = container.querySelector("span > span");
    expect(dotSpan).toBeInTheDocument();
    expect(dotSpan?.className).toContain("rounded-full");
  });
});

describe("Modal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  it("renders when open", () => {
    render(<Modal open onClose={onClose} title="My Modal">Modal body</Modal>);
    expect(screen.getByText("My Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<Modal open={false} onClose={onClose} title="Hidden">Content</Modal>);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("calls onClose on backdrop click", () => {
    render(<Modal open onClose={onClose} title="Test">Body</Modal>);
    // The backdrop is the first child div with absolute class
    const backdrop = document.querySelector(".absolute.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on Escape key", () => {
    render(<Modal open onClose={onClose} title="Esc">Body</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders description when provided", () => {
    render(<Modal open onClose={onClose} title="Title" description="A description">Body</Modal>);
    expect(screen.getByText("A description")).toBeInTheDocument();
  });
});
