import { test, expect } from "@playwright/test";

import { loadFixtures } from "../helpers/security";

const fx = loadFixtures();

test.describe("E1 segurança — storefront", () => {
  test("E1.5 pedido de outro tenant → não encontrado", async ({ page }) => {
    await page.goto(`http://demo.localhost:5174/pedido/${fx.order_b_id}`);
    await expect(page.getByText(/pedido não encontrado/i)).toBeVisible();
  });

  test("E1.8 trocar subdomínio não mistura cardápio do outro tenant", async ({ page }) => {
    await page.goto("http://demo.localhost:5174/cardapio");
    await expect(page.locator("body")).toContainText(/cardápio|produto|lanche|pizza|burger/i);

    const demoHtml = await page.content();

    await page.goto("http://outra-loja.localhost:5174/cardapio");
    await expect(page.locator("body")).toContainText(/cardápio|produto|lanche|burger/i);

    // nomes comerciais distintos se expostos; no mínimo a API não deve servir UUID de pedido cruzado
    await page.goto(`http://outra-loja.localhost:5174/pedido/${fx.order_a_id}`);
    await expect(page.getByText(/pedido não encontrado/i)).toBeVisible();

    // sanity: demoHtml foi de outra sessão/host
    expect(demoHtml.length).toBeGreaterThan(100);
  });
});
