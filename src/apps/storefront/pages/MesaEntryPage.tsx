import { isAxiosError } from "axios";
import { Armchair, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { setMesaSession, tablesPublicApi } from "@/features/tables";
import { Button } from "@/shared/components/ui/button";

function errMsg(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message || fallback;
  }
  return fallback;
}

export function MesaEntryPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("QR inválido");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const table = await tablesPublicApi.getByToken(token);
        if (cancelled) return;
        setMesaSession({
          tableId: table.table_id,
          tableNumber: table.table_number,
          qrToken: token,
        });
        navigate("/cardapio", { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(errMsg(err, "Não encontramos essa mesa"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <Armchair className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        <h1 className="text-xl font-semibold">Mesa indisponível</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{error}</p>
        <Link to="/">
          <Button type="button" variant="outline">
            Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="text-sm text-[hsl(var(--muted-foreground))]">Abrindo o cardápio da sua mesa…</p>
    </div>
  );
}
