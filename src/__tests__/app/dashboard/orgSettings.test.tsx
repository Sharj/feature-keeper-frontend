import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrgSettingsPage from "@/app/dashboard/[orgId]/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ orgId: "1" }),
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
  organizations: {
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    regenerateSsoSecret: jest.fn(),
  },
  memberships: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { organizations, memberships, ApiError } from "@/lib/api";
const mockOrgGet = organizations.get as jest.Mock;
const mockOrgUpdate = organizations.update as jest.Mock;
const mockOrgDelete = organizations.delete as jest.Mock;
const mockRegenSso = organizations.regenerateSsoSecret as jest.Mock;
const mockMemberList = memberships.list as jest.Mock;
const mockMemberCreate = memberships.create as jest.Mock;
const mockMemberUpdate = memberships.update as jest.Mock;
const mockMemberDelete = memberships.delete as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  window.confirm = jest.fn(() => true);
});

function setupMocks(orgOverrides = {}, members = [{ id: 1, role: "owner", user: { id: 1, name: "Admin", email: "admin@test.com" } }]) {
  const org = {
    id: 1, name: "Acme Corp", slug: "acme", auth_mode: "email_only", plan: { name: "Pro" },
    ...orgOverrides,
  };
  mockOrgGet.mockResolvedValueOnce({ data: org });
  mockMemberList.mockResolvedValueOnce({ data: members });
  return org;
}

describe("OrgSettingsPage", () => {
  it("renders org settings and members", async () => {
    setupMocks();
    render(<OrgSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });
    expect(screen.getByText("Organization Settings")).toBeInTheDocument();
    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    setupMocks();
    render(<OrgSettingsPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("saves org settings", async () => {
    setupMocks();
    mockOrgUpdate.mockResolvedValueOnce({
      data: { id: 1, name: "Updated Name", slug: "acme", auth_mode: "email_only" },
    });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("Acme Corp"));

    const user = userEvent.setup();
    const nameInput = screen.getByDisplayValue("Acme Corp");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    await user.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockOrgUpdate).toHaveBeenCalledWith("tok", 1, {
        organization: { name: "Updated Name", auth_mode: "email_only" },
      });
    });
  });

  it("shows SSO section when auth mode is sso_only", async () => {
    setupMocks({ auth_mode: "sso_only", sso_secret: "secret123" });
    render(<OrgSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("SSO Configuration")).toBeInTheDocument();
    });
    expect(screen.getByText("secret123")).toBeInTheDocument();
  });

  it("shows SSO section when auth mode is both", async () => {
    setupMocks({ auth_mode: "both", sso_secret: "both-secret" });
    render(<OrgSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("SSO Configuration")).toBeInTheDocument();
    });
  });

  it("hides SSO section for email_only", async () => {
    setupMocks({ auth_mode: "email_only" });
    render(<OrgSettingsPage />);

    await waitFor(() => screen.getByText("Acme Corp"));
    expect(screen.queryByText("SSO Configuration")).not.toBeInTheDocument();
  });

  it("regenerates SSO secret", async () => {
    setupMocks({ auth_mode: "sso_only", sso_secret: "old-secret" });
    mockRegenSso.mockResolvedValueOnce({ data: { sso_secret: "new-secret" } });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("SSO Configuration"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Regenerate Secret"));

    await waitFor(() => {
      expect(mockRegenSso).toHaveBeenCalledWith("tok", 1);
    });
  });

  it("invites a new member", async () => {
    setupMocks();
    mockMemberCreate.mockResolvedValueOnce({
      data: { id: 2, role: "member", user: { id: 2, name: "New", email: "new@test.com" } },
    });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("Team Members"));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("member@example.com"), "new@test.com");
    await user.click(screen.getByText("Add Member"));

    await waitFor(() => {
      expect(screen.getByText("New")).toBeInTheDocument();
    });
  });

  it("removes a member", async () => {
    setupMocks({}, [
      { id: 1, role: "owner", user: { id: 1, name: "Admin", email: "admin@test.com" } },
      { id: 2, role: "member", user: { id: 2, name: "Bob", email: "bob@test.com" } },
    ]);
    mockMemberDelete.mockResolvedValueOnce({ data: undefined });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("Bob"));

    const user = userEvent.setup();
    const removeButtons = screen.getAllByText("Remove");
    await user.click(removeButtons[1]); // Remove Bob

    await waitFor(() => {
      expect(mockMemberDelete).toHaveBeenCalledWith("tok", 1, 2);
    });
  });

  it("changes a member role", async () => {
    setupMocks({}, [
      { id: 1, role: "owner", user: { id: 1, name: "Admin", email: "admin@test.com" } },
      { id: 2, role: "member", user: { id: 2, name: "Bob", email: "bob@test.com" } },
    ]);
    mockMemberUpdate.mockResolvedValueOnce({
      data: { id: 2, role: "admin", user: { id: 2, name: "Bob", email: "bob@test.com" } },
    });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("Bob"));

    const user = userEvent.setup();
    const selects = screen.getAllByRole("combobox");
    // selects: [0]=auth_mode, [1]=invite_role, [2]=Admin's role, [3]=Bob's role
    await user.selectOptions(selects[3], "admin");

    await waitFor(() => {
      expect(mockMemberUpdate).toHaveBeenCalledWith("tok", 1, 2, { role: "admin" });
    });
  });

  it("deletes organization", async () => {
    setupMocks();
    mockOrgDelete.mockResolvedValueOnce({ data: undefined });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("Danger Zone"));

    const user = userEvent.setup();
    await user.click(screen.getByText("Delete Organization"));

    await waitFor(() => {
      expect(mockOrgDelete).toHaveBeenCalledWith("tok", 1);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles non-array members response", async () => {
    mockOrgGet.mockResolvedValueOnce({ data: { id: 1, name: "Org", slug: "org", auth_mode: "email_only" } });
    mockMemberList.mockResolvedValueOnce({ data: null });

    render(<OrgSettingsPage />);
    await waitFor(() => screen.getByText("Team Members"));
    // Should not crash
  });
});
