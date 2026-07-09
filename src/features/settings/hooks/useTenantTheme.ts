import { useEffect } from "react";

import { applyTenantTheme } from "../utils/theme";
import type { TenantTheme } from "../types/settings.types";

/** injeta as vars da loja no :root sempre que o tema mudar */
export function useTenantTheme(theme?: TenantTheme | null) {
  useEffect(() => {
    applyTenantTheme(theme);
  }, [theme]);
}
