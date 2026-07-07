import { createBrowserRouter, RouterProvider } from "react-router";

import { BackofficeLayout } from "@/apps/backoffice/layouts/BackofficeLayout";
import { DashboardPage } from "@/apps/backoffice/pages/DashboardPage";
import { LoginPage } from "@/apps/backoffice/pages/LoginPage";
import { OrdersPage } from "@/apps/backoffice/pages/OrdersPage";
import { ProductsPage } from "@/apps/backoffice/pages/ProductsPage";
import { SettingsPage } from "@/apps/backoffice/pages/SettingsPage";
import { ProtectedRoute } from "@/features/auth";

export const backofficeRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <BackofficeLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "pedidos", element: <OrdersPage /> },
      { path: "produtos", element: <ProductsPage /> },
      { path: "configuracoes", element: <SettingsPage /> },
    ],
  },
]);

export function BackofficeRoutes() {
  return <RouterProvider router={backofficeRouter} />;
}
