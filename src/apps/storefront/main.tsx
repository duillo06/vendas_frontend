import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers";
import { StorefrontRoutes } from "@/apps/storefront/routes";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <StorefrontRoutes />
    </AppProviders>
  </StrictMode>,
);
