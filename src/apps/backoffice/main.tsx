import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers";
import { BackofficeRoutes } from "@/apps/backoffice/routes";
import { AuthProvider } from "@/features/auth";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <BackofficeRoutes />
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
);
