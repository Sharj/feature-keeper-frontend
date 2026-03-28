import { test, expect } from "@playwright/test";

// Create a fresh user for the whole describe block
const email = `e2e-dash-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
let setupDone = false;

async function ensureSetup(page: any) {
  if (setupDone) {
    // Login
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    return;
  }

  // First time: register + onboard
  await page.goto("/register");
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(500);
  await page.fill('input[placeholder*="full name" i]', "Dashboard User");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Choose plan
  if (page.url().includes("choose-plan")) {
    const freeBtn = page.getByRole("button", { name: /get started/i });
    await freeBtn.click();
    await page.waitForTimeout(2000);
  }

  // Create project
  if (page.url().includes("projects/new")) {
    await page.fill("input", `Dash ${Date.now()}`);
    await page.waitForTimeout(500);
    const createBtn = page.getByRole("button", { name: /create|launch/i });
    await createBtn.click();
    await page.waitForTimeout(3000);
  }

  setupDone = true;
}

test.describe("Admin Dashboard", () => {
  test.describe.configure({ mode: "serial" });

  test("setup: creates user and project", async ({ page }) => {
    await ensureSetup(page);
    expect(page.url()).toContain("/dashboard");
  });

  test("shows ideas list with sample idea", async ({ page }) => {
    await ensureSetup(page);
    await expect(page.getByText(/ideas/i).first()).toBeVisible();
    await expect(page.getByText(/welcome.*feedback/i)).toBeVisible();
  });

  test("nav shows project name and links", async ({ page }) => {
    await ensureSetup(page);
    await expect(page.getByText(/ideas/i).first()).toBeVisible();
    await expect(page.getByText(/updates/i).first()).toBeVisible();
    await expect(page.getByText(/settings/i).first()).toBeVisible();
  });

  test("can navigate to updates page", async ({ page }) => {
    await ensureSetup(page);
    await page.click("text=Updates");
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/updates");
  });

  test("can navigate to settings page", async ({ page }) => {
    await ensureSetup(page);
    await page.click("text=Settings");
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/settings");
  });
});
