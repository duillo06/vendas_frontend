import { Link } from "react-router";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";

import { useCustomerAuth } from "@/features/customer-auth";
import { MessageTicker } from "@/shared/components/MessageTicker";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { storefrontCopy } from "@/shared/copy/storefront";

const links = [
  { to: "/conta/pedidos", label: "Meus pedidos", icon: Package },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/conta/enderecos", label: "Meus endereços", icon: MapPin },
] as const;

export function AccountPage() {
  const { customer, logout } = useCustomerAuth();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <BackLink to="/" label="Início" />

      <PageHeader
        density="compact"
        mobileHidden
        accent="chart-4"
        icon={User}
        title={storefrontCopy.account.hubTitle}
        subtitle={storefrontCopy.account.hubSubtitle}
      />

      <Card>
        <CardContent className="flex items-start gap-4 p-5">
          <div className="tile-brand flex h-12 w-12 items-center justify-center rounded-full">
            <User className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">{customer?.full_name}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{customer?.phone}</p>
            {customer?.email ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{customer.email}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="interactive-card transition-colors hover:border-[hsl(var(--primary)/0.35)]">
              <CardContent className="flex items-center gap-3 p-4">
                <link.icon className="h-5 w-5 text-brand" />
                <span className="font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <MessageTicker
        messages={[
          customer?.total_orders
            ? `💛 Você já fez ${customer.total_orders} pedido${customer.total_orders === 1 ? "" : "s"} conosco.`
            : "✨ Faça seu primeiro pedido e acompanhe tudo por aqui.",
        ]}
      />

      <Button type="button" variant="outline" className="gap-2" onClick={() => void logout()}>
        <LogOut className="h-4 w-4" />
        Sair da conta
      </Button>
    </div>
  );
}
