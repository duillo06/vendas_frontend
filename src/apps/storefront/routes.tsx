import { createBrowserRouter, RouterProvider } from "react-router";

import { StorefrontLayout } from "@/apps/storefront/layouts/StorefrontLayout";
import { CartPage } from "@/apps/storefront/pages/CartPage";
import { CategoryPage } from "@/apps/storefront/pages/CategoryPage";
import { CheckoutPage } from "@/apps/storefront/pages/CheckoutPage";
import { HomePage } from "@/apps/storefront/pages/HomePage";
import { MenuPage } from "@/apps/storefront/pages/MenuPage";
import { OrderConfirmationPage } from "@/apps/storefront/pages/OrderConfirmationPage";
import { OrderTrackingPage } from "@/apps/storefront/pages/OrderTrackingPage";
import { ProductPage } from "@/apps/storefront/pages/ProductPage";

export const storefrontRouter = createBrowserRouter([
  {
    path: "/",
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cardapio", element: <MenuPage /> },
      { path: "categoria/:slug", element: <CategoryPage /> },
      { path: "produto/:slug", element: <ProductPage /> },
      { path: "carrinho", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "pedido/:id/confirmacao", element: <OrderConfirmationPage /> },
      { path: "pedido/:id", element: <OrderTrackingPage /> },
    ],
  },
]);

export function StorefrontRoutes() {
  return <RouterProvider router={storefrontRouter} />;
}
