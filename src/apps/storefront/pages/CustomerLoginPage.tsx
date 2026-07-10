import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { useCustomerAuth } from "@/features/customer-auth";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { storefrontCopy } from "@/shared/copy/storefront";

const loginSchema = z.object({
  phone: z.string().min(8, "Telefone obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function CustomerLoginPage() {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/conta";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.phone, data.password);
      toast.success("Login realizado");
      void navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <BackLink to="/cardapio" label="Cardápio" />

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{storefrontCopy.account.loginTitle}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.account.loginSubtitle}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 98765-4321" {...register("phone")} />
              {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-brand underline">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>

      <UiHint tone="neutral">{storefrontCopy.account.guestCheckout}</UiHint>
    </div>
  );
}
