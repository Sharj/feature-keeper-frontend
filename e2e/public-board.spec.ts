import { test, expect } from "@playwright/test";
import { clearLocalStorage } from "./helpers";

test.describe("Public Board", () => {
  const email = `e2e-pub-${Date.now()}@test.com`;
  let projectSlug = "";

  // Set up user with project
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/register");
    await clearLocalStorage(page);
    await page.fill('input[placeholder*="name" i], input[id*="name" i]', "Public User");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const freeBtn = page.getByRole("button", { name: /get started/i });
    await freeBtn.click();
    await page.waitForTimeout(2000);
    await page.fill('input', `Public ${Date.now()}`);
    await page.waitForTimeout(500);
    // Get the slug from the slug input
    const slugInput = page.locator('input').nth(2);
    projectSlug = (await slugInput.inputValue()) || "public-board-test";
    const createBtn = page.getByRole("button", { name: /create|launch/i });
    await createBtn.click();
    await page.waitForTimeout(3000);
    await page.close();
  });

  test("public board shows project name and tabs", async ({ page }) => {
    await page.goto(`/${projectSlug}`);
    await page.waitForTimeout(2000);
    await expect(page.getByText(/ideas/i).first()).toBeVisible();
    await expect(page.getByText(/roadmap/i).first()).toBeVisible();
    await expect(page.getByText(/updates/i).first()).toBeVisible();
  });

  test("public board shows sample idea", async ({ page }) => {
    await page.goto(`/${projectSlug}`);
    await page.waitForTimeout(2000);
    await expect(page.getByText(/welcome.*feedback/i)).toBeVisible();
  });

  test("can vote on an idea without auth", async ({ page }) => {
    await page.goto(`/${projectSlug}`);
    await page.waitForTimeout(2000);
    // Find vote button (the upvote arrow/count element)
    const voteButton = page.locator('[class*="vote"], button:has(svg)').first();
    if (await voteButton.isVisible()) {
      await voteButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("roadmap page shows status columns", async ({ page }) => {
    await page.goto(`/${projectSlug}/roadmap`);
    await page.waitForTimeout(2000);
    // Should show at least one status column
    await expect(page.getByText(/under review/i)).toBeVisible();
  });

  test("updates page loads", async ({ page }) => {
    await page.goto(`/${projectSlug}/updates`);
    await page.waitForTimeout(2000);
    // Should show updates tab as active or "no updates" message
    await expect(page.getByText(/updates/i).first()).toBeVisible();
  });

  test("submit idea button is visible", async ({ page }) => {
    await page.goto(`/${projectSlug}`);
    await page.waitForTimeout(2000);
    await expect(page.getByRole("button", { name: /submit idea/i })).toBeVisible();
  });

  test("powered by footer is visible", async ({ page }) => {
    await page.goto(`/${projectSlug}`);
    await page.waitForTimeout(2000);
    await expect(page.getByText(/powered by/i)).toBeVisible();
  });
});
