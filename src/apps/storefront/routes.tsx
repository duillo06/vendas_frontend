import { createBrowserRouter, RouterProvider } from "react-router";

import { StorefrontLayout } from "@/apps/storefront/layouts/StorefrontLayout";
import { CartPage } from "@/apps/storefront/pages/CartPage";
import { CheckoutPage } from "@/apps/storefront/pages/CheckoutPage";
import { HomePage } from "@/apps/storefront/pages/HomePage";
import { MenuPage } from "@/apps/storefront/pages/MenuPage";

export const storefrontRouter = createBrowserRouter([
  {
    path: "/",
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cardapio", element: <MenuPage /> },
      { path: "carrinho", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
    ],
  },
]);

export function StorefrontRoutes() {
  return <RouterProvider router={storefrontRouter} />;
}
