import { Plus } from "lucide-react";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type ProductCardProps = {
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string | null;
  badge?: string;
  unavailable?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ProductCard({
  name,
  description,
  price,
  imageUrl,
  badge,
  unavailable = false,
  onClick,
  className,
}: ProductCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Card className={cn("interactive-card group overflow-hidden", unavailable && "opacity-70", className)}>
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn("w-full text-left", onClick && "cursor-pointer")}
        disabled={unavailable}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-soft))] to-[hsl(var(--accent-soft))]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
              Sem imagem
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
          {onClick && !unavailable ? (
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 translate-y-1">
              <Plus className="h-5 w-5" />
            </span>
          ) : null}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight transition-colors group-hover:text-brand">{name}</h3>
            {badge ? (
              <Badge className="border-0 bg-accent-soft text-brand-accent hover:bg-accent-soft">{badge}</Badge>
            ) : null}
          </div>
          {description ? (
            <p className="line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
          ) : null}
          <div className="flex items-center justify-between pt-1">
            <PriceDisplay value={price} className="text-lg font-bold text-brand" />
            {unavailable ? <Badge variant="outline">Indisponível</Badge> : null}
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}
