import { useEffect } from "react";

import type { CompanyPublic } from "../types/company.types";
import { applyStoreFavicon } from "../utils/applyStoreFavicon";

/** logo na aba + nome da loja no título */
export function useStoreBranding(company?: CompanyPublic | null) {
  useEffect(() => {
    applyStoreFavicon(company?.logo_url ?? null);
    if (company?.trade_name) {
      document.title = company.trade_name;
    }
  }, [company?.logo_url, company?.trade_name]);
}
