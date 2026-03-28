import { Page } from "@playwright/test";

export const TEST_USER = {
  name: "E2E Test User",
  email: `e2e-${Date.now()}@test.com`,
  password: "password123",
};

export async function register(page: Page) {
  await page.goto("/register");
  await page.waitForTimeout(500);
  await page.fill('input[placeholder*="name" i], input[id*="name" i]', TEST_USER.name);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

export async function choosePlan(page: Page) {
  // Should be on choose-plan page after register
  await page.waitForURL("**/choose-plan**", { timeout: 5000 });
  // Click "Get Started" (Free plan)
  const freeButton = page.getByRole("button", { name: /get started/i });
  await freeButton.click();
  await page.waitForTimeout(2000);
}

export async function createProject(page: Page, name: string = "Test Project") {
  await page.waitForURL("**/projects/new**", { timeout: 5000 });
  await page.fill('input[placeholder*="name" i], input[id*="product" i]', name);
  await page.waitForTimeout(500);
  // Submit
  const submitButton = page.getByRole("button", { name: /create|launch/i });
  await submitButton.click();
  await page.waitForTimeout(2000);
}

export async function fullOnboarding(page: Page) {
  await register(page);
  await choosePlan(page);
  await createProject(page);
  // Should now be on dashboard
  await page.waitForURL("**/dashboard**", { timeout: 5000 });
}

export async function login(page: Page, email?: string, password?: string) {
  await page.goto("/login");
  await page.waitForTimeout(500);
  await page.fill('input[type="email"]', email || TEST_USER.email);
  await page.fill('input[type="password"]', password || TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}
