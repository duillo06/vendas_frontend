import { createBrowserRouter, Navigate, RouterProvider } from "react-router";

import { BackofficeLayout } from "@/apps/backoffice/layouts/BackofficeLayout";
import { CategoriesPage } from "@/apps/backoffice/pages/CategoriesPage";
import { ConexoesPage } from "@/apps/backoffice/pages/ConexoesPage";
import { ConexoesTemplatesPage } from "@/apps/backoffice/pages/ConexoesTemplatesPage";
import { ConexoesWhatsAppPage } from "@/apps/backoffice/pages/ConexoesWhatsAppPage";
import { CustomerDetailPage } from "@/apps/backoffice/pages/CustomerDetailPage";
import { CustomersPage } from "@/apps/backoffice/pages/CustomersPage";
import { DashboardPage } from "@/apps/backoffice/pages/DashboardPage";
import { LoginPage } from "@/apps/backoffice/pages/LoginPage";
import { OrderDetailPage } from "@/apps/backoffice/pages/OrderDetailPage";
import { OrdersPage } from "@/apps/backoffice/pages/OrdersPage";
import { ProductFormPage } from "@/apps/backoffice/pages/ProductFormPage";
import { ProductManagePage } from "@/apps/backoffice/pages/ProductManagePage";
import { ProductWizardPage } from "@/apps/backoffice/pages/ProductWizardPage";
import { ProductsPage } from "@/apps/backoffice/pages/ProductsPage";
import { PromotionsPage } from "@/apps/backoffice/pages/PromotionsPage";
import { SettingsPage } from "@/apps/backoffice/pages/SettingsPage";
import { PermissionRoute, ProtectedRoute } from "@/features/auth";

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
      {
        index: true,
        element: (
          <PermissionRoute permission="dashboard.view" fallbackTo="/pedidos">
            <DashboardPage />
          </PermissionRoute>
        ),
      },
      { path: "pedidos", element: <OrdersPage /> },
      { path: "pedidos/:id", element: <OrderDetailPage /> },
      {
        path: "clientes",
        element: (
          <PermissionRoute permission="customers.view">
            <CustomersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "clientes/:id",
        element: (
          <PermissionRoute permission="customers.view">
            <CustomerDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "produtos",
        element: (
          <PermissionRoute permission="catalog.view">
            <ProductsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "produtos/novo",
        element: (
          <PermissionRoute permission="catalog.manage">
            <ProductWizardPage />
          </PermissionRoute>
        ),
      },
      {
        path: "produtos/novo/avancado",
        element: (
          <PermissionRoute permission="catalog.manage">
            <ProductFormPage />
          </PermissionRoute>
        ),
      },
      {
        path: "produtos/:id",
        element: (
          <PermissionRoute permission="catalog.view">
            <ProductManagePage />
          </PermissionRoute>
        ),
      },
      {
        path: "produtos/:id/avancado",
        element: (
          <PermissionRoute permission="catalog.manage">
            <ProductFormPage />
          </PermissionRoute>
        ),
      },
      {
        path: "categorias",
        element: (
          <PermissionRoute permission="catalog.view">
            <CategoriesPage />
          </PermissionRoute>
        ),
      },
      // Base do cardápio saiu do menu — cria na conversa da categoria
      { path: "opcoes", element: <Navigate to="/categorias" replace /> },
      {
        path: "promocoes",
        element: (
          <PermissionRoute permission="promotions.manage">
            <PromotionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "conexoes",
        element: (
          <PermissionRoute permission="connections.manage">
            <ConexoesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "conexoes/whatsapp",
        element: (
          <PermissionRoute permission="connections.manage">
            <ConexoesWhatsAppPage />
          </PermissionRoute>
        ),
      },
      {
        path: "conexoes/whatsapp/templates",
        element: (
          <PermissionRoute permission="connections.manage">
            <ConexoesTemplatesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "configuracoes",
        element: (
          <PermissionRoute permission="settings.manage">
            <SettingsPage />
          </PermissionRoute>
        ),
      },
    ],
  },
]);

export function BackofficeRoutes() {
  return <RouterProvider router={backofficeRouter} />;
}
