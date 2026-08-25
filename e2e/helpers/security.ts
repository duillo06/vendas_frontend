import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { type Page, expect } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const fixturesPath = path.resolve(__dirname, "../.auth/fixtures.json");

export type SecurityFixtures = {
  tenant_a: { subdomain: string; id: string };
  tenant_b: { subdomain: string; id: string };
  owner_a: { email: string; password: string };
  owner_b: { email: string; password: string };
  kitchen: { email: string; password: string };
  operator: { email: string; password: string };
  order_a_id: string;
  order_b_id: string;
};

export function loadFixtures(): SecurityFixtures {
  if (!fs.existsSync(fixturesPath)) {
    throw new Error(
      `Fixtures ausentes em ${fixturesPath}. Rode: python manage.py seed_e2e_security --out ...`,
    );
  }
  return JSON.parse(fs.readFileSync(fixturesPath, "utf-8")) as SecurityFixtures;
}

export async function adminLogin(
  page: Page,
  creds: { email: string; password: string },
  subdomain: string,
) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(creds.email);
  await page.getByLabel("Senha").fill(creds.password);
  await page.getByLabel("Subdomínio").fill(subdomain);
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

export async function adminLogout(page: Page) {
  const logout = page.getByRole("button", { name: /sair|encerrar/i }).or(
    page.locator("button").filter({ hasText: /sair/i }),
  );
  // sidebar: botão com ícone LogOut — aria ou texto
  const candidates = [
    page.getByRole("button", { name: /sair/i }),
    page.locator("button", { has: page.locator("svg.lucide-log-out") }),
    page.locator('[aria-label*="Sair" i]'),
  ];
  for (const loc of candidates) {
    if (await loc.first().isVisible().catch(() => false)) {
      await loc.first().click();
      break;
    }
  }
  await expect(page).toHaveURL(/\/login/);
}
