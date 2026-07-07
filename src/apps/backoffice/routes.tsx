import { createBrowserRouter, RouterProvider } from "react-router";

import { BackofficeLayout } from "@/apps/backoffice/layouts/BackofficeLayout";
import { DashboardPage } from "@/apps/backoffice/pages/DashboardPage";
import { LoginPage } from "@/apps/backoffice/pages/LoginPage";

export const backofficeRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <BackofficeLayout />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
]);

export function BackofficeRoutes() {
  return <RouterProvider router={backofficeRouter} />;
}
