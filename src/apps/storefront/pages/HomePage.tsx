import { Button } from "@/shared/components/ui/button";

export function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Cardápio digital</h1>
      <p className="max-w-xl text-[hsl(var(--muted-foreground))]">
        Storefront do Food Service — Sprint 0. O cardápio completo entra na Sprint 5.
      </p>
      <Button>Explorar em breve</Button>
    </section>
  );
}
