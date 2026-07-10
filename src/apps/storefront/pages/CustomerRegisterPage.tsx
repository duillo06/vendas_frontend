import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
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

const registerSchema = z.object({
  first_name: z.string().min(2, "Nome obrigatório"),
  phone: z.string().min(8, "Telefone obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function CustomerRegisterPage() {
  const { register: registerCustomer } = useCustomerAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await registerCustomer({
        first_name: data.first_name,
        phone: data.phone,
        password: data.password,
        email: data.email || undefined,
      });
      toast.success("Conta criada com sucesso");
      void navigate("/conta", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a conta");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <BackLink to="/entrar" label="Entrar" />

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{storefrontCopy.account.registerTitle}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.account.registerSubtitle}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nome</Label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name ? (
                <p className="text-xs text-red-600">{errors.first_name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 98765-4321" {...register("phone")} />
              {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm">
            Já tem conta?{" "}
            <Link to="/entrar" className="font-medium text-brand underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>

      <UiHint tone="neutral">{storefrontCopy.account.guestCheckout}</UiHint>
    </div>
  );
}
