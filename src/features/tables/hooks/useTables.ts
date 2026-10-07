import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tablesAdminApi } from "../api/tablesAdminApi";
import type { DiningTableWrite } from "../types/table.types";

const KEY = ["admin", "tables"] as const;

export function useTables() {
  return useQuery({
    queryKey: KEY,
    queryFn: tablesAdminApi.list,
  });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DiningTableWrite) => tablesAdminApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DiningTableWrite> }) =>
      tablesAdminApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tablesAdminApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkTables() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ count, start }: { count: number; start?: number }) =>
      tablesAdminApi.bulk(count, start),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRegenerateTableQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tablesAdminApi.regenerateQr(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
