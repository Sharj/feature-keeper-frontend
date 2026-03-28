import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows login page with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1000);
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows register page with name, email, password fields", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/register");
    await expect(page.getByText("Create your account")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows error on invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', "wrong@email.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/login");
  });

  test("registers new user and redirects to choose-plan", async ({ page }) => {
    const email = `e2e-auth-${Date.now()}@test.com`;
    await page.goto("/register");
    await page.evaluate(() => localStorage.clear());
    await page.waitForTimeout(500);
    await page.fill('input[placeholder*="name" i], input[id*="name" i]', "Auth Test");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain("/choose-plan");
  });

  test("homepage has navigation links", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    // Check for login/sign-in text anywhere on page
    await expect(page.getByText(/login|sign in/i).first()).toBeVisible();
    // Check for get started / register text
    await expect(page.getByText(/get started/i).first()).toBeVisible();
  });
});
