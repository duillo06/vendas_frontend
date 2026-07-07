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
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)}>
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn("w-full text-left", onClick && "cursor-pointer")}
        disabled={unavailable}
      >
        <div className="aspect-[4/3] bg-[hsl(var(--muted))]">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
              Sem imagem
            </div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{name}</h3>
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </div>
          {description ? (
            <p className="line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
          ) : null}
          <div className="flex items-center justify-between">
            <PriceDisplay value={price} className="font-semibold text-[hsl(var(--primary))]" />
            {unavailable ? <Badge variant="outline">Indisponível</Badge> : null}
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}
