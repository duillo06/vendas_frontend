import { createBrowserRouter, RouterProvider } from "react-router";

import { BackofficeLayout } from "@/apps/backoffice/layouts/BackofficeLayout";
import { CategoriesPage } from "@/apps/backoffice/pages/CategoriesPage";
import { CustomerDetailPage } from "@/apps/backoffice/pages/CustomerDetailPage";
import { CustomersPage } from "@/apps/backoffice/pages/CustomersPage";
import { DashboardPage } from "@/apps/backoffice/pages/DashboardPage";
import { LoginPage } from "@/apps/backoffice/pages/LoginPage";
import { OptionGroupsPage } from "@/apps/backoffice/pages/OptionGroupsPage";
import { OrderDetailPage } from "@/apps/backoffice/pages/OrderDetailPage";
import { OrdersPage } from "@/apps/backoffice/pages/OrdersPage";
import { ProductFormPage } from "@/apps/backoffice/pages/ProductFormPage";
import { ProductWizardPage } from "@/apps/backoffice/pages/ProductWizardPage";
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
      { path: "pedidos/:id", element: <OrderDetailPage /> },
      { path: "clientes", element: <CustomersPage /> },
      { path: "clientes/:id", element: <CustomerDetailPage /> },
      { path: "produtos", element: <ProductsPage /> },
      { path: "produtos/novo", element: <ProductWizardPage /> },
      { path: "produtos/novo/avancado", element: <ProductFormPage /> },
      { path: "produtos/:id", element: <ProductFormPage /> },
      { path: "categorias", element: <CategoriesPage /> },
      { path: "opcoes", element: <OptionGroupsPage /> },
      { path: "configuracoes", element: <SettingsPage /> },
    ],
  },
]);

export function BackofficeRoutes() {
  return <RouterProvider router={backofficeRouter} />;
}
