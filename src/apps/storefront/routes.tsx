import { createBrowserRouter, RouterProvider } from "react-router";

import { StorefrontLayout } from "@/apps/storefront/layouts/StorefrontLayout";
import { HomePage } from "@/apps/storefront/pages/HomePage";

export const storefrontRouter = createBrowserRouter([
  {
    path: "/",
    element: <StorefrontLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);

export function StorefrontRoutes() {
  return <RouterProvider router={storefrontRouter} />;
}
