import { createBrowserRouter, RouterProvider } from "react-router";

import { StorefrontLayout } from "@/apps/storefront/layouts/StorefrontLayout";
import { AccountAddressesPage } from "@/apps/storefront/pages/AccountAddressesPage";
import { AccountOrdersPage } from "@/apps/storefront/pages/AccountOrdersPage";
import { AccountPage } from "@/apps/storefront/pages/AccountPage";
import { CartPage } from "@/apps/storefront/pages/CartPage";
import { CategoryPage } from "@/apps/storefront/pages/CategoryPage";
import { CheckoutPage } from "@/apps/storefront/pages/CheckoutPage";
import { CustomerLoginPage } from "@/apps/storefront/pages/CustomerLoginPage";
import { CustomerRegisterPage } from "@/apps/storefront/pages/CustomerRegisterPage";
import { HomePage } from "@/apps/storefront/pages/HomePage";
import { MenuPage } from "@/apps/storefront/pages/MenuPage";
import { OrderConfirmationPage } from "@/apps/storefront/pages/OrderConfirmationPage";
import { OrderTrackingPage } from "@/apps/storefront/pages/OrderTrackingPage";
import { ProductPage } from "@/apps/storefront/pages/ProductPage";
import { CustomerProtectedRoute } from "@/features/customer-auth";

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
      { path: "entrar", element: <CustomerLoginPage /> },
      { path: "cadastro", element: <CustomerRegisterPage /> },
      {
        path: "conta",
        element: (
          <CustomerProtectedRoute>
            <AccountPage />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "conta/pedidos",
        element: (
          <CustomerProtectedRoute>
            <AccountOrdersPage />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "conta/enderecos",
        element: (
          <CustomerProtectedRoute>
            <AccountAddressesPage />
          </CustomerProtectedRoute>
        ),
      },
      { path: "pedido/:id/confirmacao", element: <OrderConfirmationPage /> },
      { path: "pedido/:id", element: <OrderTrackingPage /> },
    ],
  },
]);

export function StorefrontRoutes() {
  return <RouterProvider router={storefrontRouter} />;
}
