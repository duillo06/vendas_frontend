import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers";
import { StorefrontRoutes } from "@/apps/storefront/routes";
import { CustomerAuthProvider } from "@/features/customer-auth";
import { configureStorefrontApiClient } from "@/shared/lib/api-client";
import "@/styles/globals.css";

configureStorefrontApiClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <CustomerAuthProvider>
        <StorefrontRoutes />
      </CustomerAuthProvider>
    </AppProviders>
  </StrictMode>,
);
