import { useQuery } from "@tanstack/react-query";

import { companyApi } from "../api/companyApi";
import { companyKeys } from "../constants/query-keys";

export function useCompanyPublic() {
  return useQuery({
    queryKey: companyKeys.public(),
    queryFn: () => companyApi.getPublic(),
    staleTime: 1000 * 60 * 5,
  });
}
