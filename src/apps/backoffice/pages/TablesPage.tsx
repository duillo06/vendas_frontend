import { isAxiosError } from "axios";
import { Armchair, Loader2, Plus, Printer, QrCode, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useBulkTables,
  useCreateTable,
  useDeleteTable,
  useRegenerateTableQr,
  useTables,
  useUpdateTable,
  type DiningTable,
} from "@/features/tables";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

function errMsg(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string }; detail?: string } | undefined;
    return data?.error?.message || data?.detail || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function qrImageUrl(url: string, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

function printTableQr(table: DiningTable) {
  const img = qrImageUrl(table.qr_url, 280);
  const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=560");
  if (!w) {
    toast.error("Permita pop-ups para imprimir o QR");
    return;
  }
  w.document.write(`<!doctype html><html><head><title>Mesa ${table.number}</title>
<style>
  body{font-family:system-ui,sans-serif;text-align:center;padding:2rem;color:#111}
  h1{font-size:1.75rem;margin:0 0 .25rem}
  p{color:#555;margin:.25rem 0 1.25rem}
  img{width:280px;height:280px}
</style></head><body>
  <h1>Mesa ${table.number}</h1>
  <p>Aponte a câmera do celular e peça por aqui.</p>
  <img src="${img}" alt="QR Mesa ${table.number}" />
  <script>window.onload=()=>{window.print();}</script>
</body></html>`);
  w.document.close();
}

export function TablesPage() {
  const { data: tables = [], isLoading } = useTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();
  const bulkTables = useBulkTables();
  const regenQr = useRegenerateTableQr();

  const [number, setNumber] = useState("");
  const [label, setLabel] = useState("");
  const [bulkCount, setBulkCount] = useState("5");

  const activeCount = useMemo(() => tables.filter((t) => t.is_active).length, [tables]);

  const handleCreate = async () => {
    if (!number.trim()) {
      toast.error("Informe o número da mesa");
      return;
    }
    try {
      await createTable.mutateAsync({
        number: number.trim(),
        label: label.trim() || undefined,
      });
      setNumber("");
      setLabel("");
      toast.success("Mesa criada");
    } catch (err) {
      toast.error(errMsg(err, "Não foi possível criar a mesa"));
    }
  };

  const handleBulk = async () => {
    const count = Number(bulkCount);
    if (!count || count < 1) {
      toast.error("Quantas mesas você quer criar?");
      return;
    }
    try {
      const created = await bulkTables.mutateAsync({ count });
      toast.success(`${created.length} mesas criadas`);
    } catch (err) {
      toast.error(errMsg(err, "Não foi possível criar as mesas"));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mesas</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Cadastre as mesas, imprima os QRs e receba pedidos do salão no painel.
          {tables.length > 0 ? (
            <>
              {" "}
              · {activeCount} ativa{activeCount === 1 ? "" : "s"}
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-brand" />
              Nova mesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="table-number">Número</Label>
                <Input
                  id="table-number"
                  placeholder="Ex.: 12"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="table-label">Apelido (opcional)</Label>
                <Input
                  id="table-label"
                  placeholder="Ex.: Varanda"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createTable.isPending}
              className="w-full sm:w-auto"
            >
              {createTable.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar mesa"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Armchair className="h-4 w-4 text-brand" />
              Criar várias de uma vez
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-count">Quantas mesas você tem?</Label>
              <Input
                id="bulk-count"
                type="number"
                min={1}
                max={100}
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
              />
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Cria mesas numeradas em sequência (pula números que já existem).
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleBulk}
              disabled={bulkTables.isPending}
              className="w-full sm:w-auto"
            >
              {bulkTables.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar mesas"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suas mesas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : tables.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-4 py-10 text-center">
              <Armchair className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              <p className="mt-3 font-medium">Nenhuma mesa ainda</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Crie a primeira mesa ou gere várias de uma vez para imprimir os QRs.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {tables.map((table) => (
                <li
                  key={table.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <img
                      src={qrImageUrl(table.qr_url, 88)}
                      alt={`QR mesa ${table.number}`}
                      className="h-[88px] w-[88px] rounded-lg border border-[hsl(var(--border))] bg-white p-1"
                    />
                    <div className="min-w-0">
                      <p className="text-lg font-semibold tracking-tight">Mesa {table.number}</p>
                      {table.label ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{table.label}</p>
                      ) : null}
                      <p className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">
                        {table.is_active ? "Ativa · aceita pedidos" : "Inativa"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="mr-2 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                        checked={table.is_active}
                        onChange={async (e) => {
                          try {
                            await updateTable.mutateAsync({
                              id: table.id,
                              payload: { is_active: e.target.checked },
                            });
                          } catch (err) {
                            toast.error(errMsg(err, "Não foi possível atualizar"));
                          }
                        }}
                      />
                      Ativa
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => printTableQr(table)}
                    >
                      <Printer className="mr-1 h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={regenQr.isPending}
                      onClick={async () => {
                        try {
                          await regenQr.mutateAsync(table.id);
                          toast.success("Novo QR gerado · o anterior não funciona mais");
                        } catch (err) {
                          toast.error(errMsg(err, "Falha ao regenerar QR"));
                        }
                      }}
                    >
                      <QrCode className="mr-1 h-4 w-4" />
                      Novo QR
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteTable.isPending}
                      onClick={async () => {
                        if (!window.confirm(`Remover ou desativar a mesa ${table.number}?`)) return;
                        try {
                          await deleteTable.mutateAsync(table.id);
                          toast.success("Mesa atualizada");
                        } catch (err) {
                          toast.error(errMsg(err, "Não foi possível remover"));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
