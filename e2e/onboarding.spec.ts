import { test, expect } from "@playwright/test";
import { clearLocalStorage } from "./helpers";

test.describe("Onboarding Flow", () => {
  const email = `e2e-onboard-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;

  test("full flow: register → choose plan → create project → dashboard", async ({ page }) => {
    await page.goto("/register");
    await clearLocalStorage(page);

    // Step 1: Register
    await page.fill('input[placeholder*="full name" i]', "Onboard User");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Step 2: Choose plan - should see Free and Pro options
    await expect(page.url()).toContain("/choose-plan");
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();

    // Select Free plan
    const freeButton = page.getByRole("button", { name: /get started/i });
    await freeButton.click();
    await page.waitForTimeout(2000);

    // Step 3: Create project
    expect(page.url()).toContain("/projects/new");
    await page.locator('input').first().fill(`E2E Product ${Date.now()}`);
    await page.waitForTimeout(500);

    // Click create/launch button
    const createBtn = page.getByRole("button", { name: /create|launch/i });
    await createBtn.click();
    await page.waitForTimeout(3000);

    // Step 4: Should be on dashboard with the project
    expect(page.url()).toContain("/dashboard");
    await expect(page.getByText(/ideas/i).first()).toBeVisible();
  });
});
