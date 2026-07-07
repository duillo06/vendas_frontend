import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/apps/backoffice/layouts/AuthLayout";
import { GuestRoute, useAuth } from "@/features/auth";
import { env } from "@/shared/config/env";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
  subdomain: z.string().min(1, "Subdomínio obrigatório"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      subdomain: env.VITE_DEFAULT_TENANT_SUBDOMAIN,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password, data.subdomain);
      toast.success("Login realizado");
      void navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Painel do estabelecimento</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subdomain">Subdomínio</Label>
          <Input id="subdomain" placeholder="demo" {...register("subdomain")} />
          {errors.subdomain ? <p className="text-xs text-red-600">{errors.subdomain.message}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          Dev: admin@demo.com / demo1234
        </p>
      </form>
    </AuthLayout>
  );
}

export function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  );
}
