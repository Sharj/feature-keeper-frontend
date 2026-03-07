import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EndUserAuthModal from "@/components/public/EndUserAuthModal";
import { EndUserProvider } from "@/contexts/EndUserContext";

// Mock the API
jest.mock("@/lib/api", () => ({
  endUserAuth: {
    sendCode: jest.fn(),
    sso: jest.fn(),
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

import { endUserAuth, ApiError } from "@/lib/api";

const mockSendCode = endUserAuth.sendCode as jest.Mock;
const mockSso = endUserAuth.sso as jest.Mock;

function renderModal(props: Partial<{ orgSlug: string; authMode: string; open: boolean; onClose: () => void }> = {}) {
  const defaultProps = {
    orgSlug: "acme",
    authMode: "email_only",
    open: true,
    onClose: jest.fn(),
  };
  const merged = { ...defaultProps, ...props };
  return {
    ...render(
      <EndUserProvider orgSlug="acme" boardSlug="features">
        <EndUserAuthModal {...merged} />
      </EndUserProvider>
    ),
    onClose: merged.onClose,
  };
}

beforeEach(() => {
  localStorage.clear();
  mockSendCode.mockReset();
  mockSso.mockReset();
});

describe("EndUserAuthModal", () => {
  it("returns null when not open", () => {
    const { container } = renderModal({ open: false });
    expect(container.innerHTML).toBe("");
  });

  it("shows email form for email_only auth mode", () => {
    renderModal({ authMode: "email_only" });
    expect(screen.getByText("Sign In to Participate")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByText("Continue with Email")).toBeInTheDocument();
    expect(screen.queryByText("Sign in with SSO")).not.toBeInTheDocument();
  });

  it("shows SSO form for sso_only auth mode", () => {
    renderModal({ authMode: "sso_only" });
    expect(screen.getByPlaceholderText("Paste your SSO token")).toBeInTheDocument();
    expect(screen.getByText("Sign in with SSO")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Your name")).not.toBeInTheDocument();
  });

  it("shows both forms with divider for both auth mode", () => {
    renderModal({ authMode: "both" });
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Paste your SSO token")).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const { onClose } = renderModal();
    const user = userEvent.setup();
    await user.click(screen.getByText("\u00d7"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits email and shows verification message when not verified", async () => {
    mockSendCode.mockResolvedValueOnce({ data: { id: 1, verified: false, name: "Jane", email: "j@t.co" } });
    renderModal({ authMode: "email_only" });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Your name"), "Jane");
    await user.type(screen.getByPlaceholderText("you@example.com"), "j@t.co");
    await user.click(screen.getByText("Continue with Email"));

    await waitFor(() => {
      expect(screen.getByText("A verification link has been sent to")).toBeInTheDocument();
    });
    expect(screen.getByText("j@t.co")).toBeInTheDocument();
    expect(mockSendCode).toHaveBeenCalledWith("acme", { email: "j@t.co", name: "Jane" });
  });

  it("directly sets user when already verified", async () => {
    const onClose = jest.fn();
    mockSendCode.mockResolvedValueOnce({
      data: { id: 5, verified: true, name: "Joe", email: "joe@test.com" },
    });
    renderModal({ authMode: "email_only", onClose });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Your name"), "Joe");
    await user.type(screen.getByPlaceholderText("you@example.com"), "joe@test.com");
    await user.click(screen.getByText("Continue with Email"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(JSON.parse(localStorage.getItem("enduser_acme_features")!).end_user_id).toBe(5);
  });

  it("shows error on email submit failure", async () => {
    mockSendCode.mockRejectedValueOnce(new (ApiError as unknown as new (s: number, m: string) => Error)(422, "Invalid email"));
    renderModal({ authMode: "email_only" });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Your name"), "X");
    await user.type(screen.getByPlaceholderText("you@example.com"), "bad@test.com");
    await user.click(screen.getByText("Continue with Email"));

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("SSO submit calls sso and sets user", async () => {
    const onClose = jest.fn();
    mockSso.mockResolvedValueOnce({
      data: { id: 7, verified: true, name: "SsoUser", email: "sso@test.com" },
    });
    renderModal({ authMode: "sso_only", onClose });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Paste your SSO token"), "my-jwt");
    await user.click(screen.getByText("Sign in with SSO"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(mockSso).toHaveBeenCalledWith("acme", { sso_token: "my-jwt" });
  });

  it("shows error on SSO failure", async () => {
    mockSso.mockRejectedValueOnce(new (ApiError as unknown as new (s: number, m: string) => Error)(401, "Invalid token"));
    renderModal({ authMode: "sso_only" });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Paste your SSO token"), "bad-jwt");
    await user.click(screen.getByText("Sign in with SSO"));

    await waitFor(() => {
      expect(screen.getByText("Invalid token")).toBeInTheDocument();
    });
  });

  it("shows generic error on non-ApiError failure", async () => {
    mockSso.mockRejectedValueOnce(new Error("Network error"));
    renderModal({ authMode: "sso_only" });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Paste your SSO token"), "tok");
    await user.click(screen.getByText("Sign in with SSO"));

    await waitFor(() => {
      expect(screen.getByText("SSO authentication failed")).toBeInTheDocument();
    });
  });
});
