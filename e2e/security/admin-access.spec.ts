import { test, expect } from "@playwright/test";

import { adminLogin, loadFixtures } from "../helpers/security";

const fx = loadFixtures();

test.describe("E1 segurança — backoffice", () => {
  test("E1.1 sem login: /pedidos redireciona para login", async ({ page }) => {
    await page.goto("/pedidos");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
  });

  test("E1.2 owner T-A não vê pedido de T-B", async ({ page }) => {
    await adminLogin(page, fx.owner_a, fx.tenant_a.subdomain);
    await page.goto(`/pedidos/${fx.order_b_id}`);
    await expect(page.getByText(/pedido não encontrado/i)).toBeVisible();
  });

  test("E1.3 kitchen: Settings e Produtos fora do menu e da URL", async ({ page }) => {
    await adminLogin(page, fx.kitchen, fx.tenant_a.subdomain);
    await expect(page.getByRole("link", { name: /^Pedidos$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Produtos$/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Configurações$/ })).toHaveCount(0);

    await page.goto("/configuracoes");
    await expect(page).toHaveURL(/\/pedidos\/?$/);

    await page.goto("/produtos");
    await expect(page).toHaveURL(/\/pedidos\/?$/);
  });

  test("E1.4 operator: /promocoes redireciona sem promotions.manage", async ({ page }) => {
    await adminLogin(page, fx.operator, fx.tenant_a.subdomain);
    await page.goto("/promocoes");
    await expect(page).toHaveURL(/\/pedidos\/?$/);
  });

  test("E1.6 logout + back não reabre painel", async ({ page }) => {
    await adminLogin(page, fx.owner_a, fx.tenant_a.subdomain);
    await page.goto("/pedidos");
    await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

    await page.getByTitle("Sair").click();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await expect(page).toHaveURL(/\/login/);
  });

  test("E1.7 customer token não acessa backoffice", async ({ page, request }) => {
    const apiPort = process.env.VITE_API_PORT || "8011";
    const phone = `(11) 9${String(Date.now()).slice(-8)}`;
    const reg = await request.post(
      `http://demo.localhost:${apiPort}/api/v1/auth/customer/register/`,
      {
        data: {
          phone,
          password: "cliente12",
          first_name: "Cliente",
          last_name: "E2E",
        },
      },
    );
    expect(reg.ok(), await reg.text()).toBeTruthy();
    const access = (await reg.json()).access as string;

    await page.goto("/login");
    await page.evaluate((token) => {
      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", "invalid-refresh");
      localStorage.setItem("tenant_id", "x");
    }, access);
    await page.goto("/pedidos");
    await expect(page).toHaveURL(/\/login/);
  });
});
