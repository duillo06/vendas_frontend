import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { customerAuthApi, type CustomerAddressPayload } from "@/features/customer-auth";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";

const emptyForm: CustomerAddressPayload = {
  label: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
  reference: "",
  is_default: false,
};

export function AccountAddressesPage() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [form, setForm] = useState<CustomerAddressPayload>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["account", "addresses"],
    queryFn: () => customerAuthApi.listAddresses(),
  });

  const createAddress = useMutation({
    mutationFn: () => customerAuthApi.createAddress(form),
    onSuccess: () => {
      toast.success("Endereço salvo");
      setForm(emptyForm);
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: ["account", "addresses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => customerAuthApi.updateAddress(id, { is_default: true }),
    onSuccess: () => {
      toast.success("Endereço padrão atualizado");
      void queryClient.invalidateQueries({ queryKey: ["account", "addresses"] });
    },
  });

  const removeAddress = useMutation({
    mutationFn: (id: string) => customerAuthApi.deleteAddress(id),
    onSuccess: () => {
      toast.success("Endereço removido");
      void queryClient.invalidateQueries({ queryKey: ["account", "addresses"] });
    },
  });

  const handleDelete = async (id: string, label: string) => {
    const confirmed = await confirm({
      title: "Remover endereço",
      description: `Remover "${label || "este endereço"}"?`,
      confirmLabel: "Remover",
      destructive: true,
    });
    if (confirmed) removeAddress.mutate(id);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <BackLink to="/conta" label="Minha conta" />
          <h1 className="text-2xl font-bold">{storefrontCopy.account.addressesTitle}</h1>
        </div>
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Cancelar" : "Novo endereço"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
            {(
              [
                ["label", "Apelido (Casa, Trabalho...)", false],
                ["zip_code", "CEP", false],
                ["street", "Rua", true],
                ["number", "Número", true],
                ["complement", "Complemento", false],
                ["neighborhood", "Bairro", true],
                ["city", "Cidade", true],
                ["state", "UF", true],
                ["reference", "Referência", false],
              ] as const
            ).map(([field, label, required]) => (
              <div key={field} className={field === "street" || field === "reference" ? "sm:col-span-2" : ""}>
                <Label htmlFor={field}>{label}</Label>
                <Input
                  id={field}
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  required={required}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Button
                type="button"
                className="w-full"
                disabled={createAddress.isPending}
                onClick={() => createAddress.mutate()}
              >
                Salvar endereço
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : addresses?.length ? (
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li key={address.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {address.label || "Endereço"}
                        {address.is_default ? (
                          <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">
                            Padrão
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {address.street}, {address.number}
                        {address.complement ? ` — ${address.complement}` : ""}
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {address.neighborhood} · {address.city}/{address.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!address.is_default ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setDefault.mutate(address.id)}
                      >
                        Tornar padrão
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleDelete(address.id, address.label)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {storefrontCopy.account.addressesEmpty}
          </p>
        </div>
      )}
    </div>
  );
}
