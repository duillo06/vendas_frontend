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
      { path: "produtos/:id", element: <ProductManagePage /> },
      { path: "produtos/:id/avancado", element: <ProductFormPage /> },
      { path: "categorias", element: <CategoriesPage /> },
      // Base do cardápio saiu do menu — cria na conversa da categoria
      { path: "opcoes", element: <Navigate to="/categorias" replace /> },
      { path: "promocoes", element: <PromotionsPage /> },
      { path: "conexoes", element: <ConexoesPage /> },
      { path: "conexoes/whatsapp", element: <ConexoesWhatsAppPage /> },
      { path: "conexoes/whatsapp/templates", element: <ConexoesTemplatesPage /> },
      { path: "configuracoes", element: <SettingsPage /> },
    ],
  },
]);

export function BackofficeRoutes() {
  return <RouterProvider router={backofficeRouter} />;
}
