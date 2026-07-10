import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ProductImage } from "../types/catalog.types";

import { cn } from "@/shared/lib/utils";

type ProductImageCarouselProps = {
  images: ProductImage[];
  productName: string;
  className?: string;
};

export function ProductImageCarousel({ images, productName, className }: ProductImageCarouselProps) {
  const sortedImages = useMemo(() => {
    if (images.length <= 1) {
      return images;
    }
    return [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  }, [images]);

  const initialIndex = Math.max(
    0,
    sortedImages.findIndex((image) => image.is_primary),
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  useEffect(() => {
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0);
  }, [initialIndex, sortedImages.length]);

  if (!sortedImages.length) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
          className,
        )}
      >
        Sem imagem
      </div>
    );
  }

  const activeImage = sortedImages[activeIndex] ?? sortedImages[0];
  const hasMultiple = sortedImages.length > 1;

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + sortedImages.length) % sortedImages.length);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % sortedImages.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[hsl(var(--muted))]">
        <img
          src={activeImage.image_url}
          alt={activeImage.alt_text || productName}
          className="h-full w-full object-cover"
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[hsl(var(--foreground))] shadow-md transition hover:bg-white"
              onClick={goPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[hsl(var(--foreground))] shadow-md transition hover:bg-white"
              onClick={goNext}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {activeIndex + 1}/{sortedImages.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Ver foto ${index + 1}`}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                index === activeIndex ? "border-brand ring-2 ring-brand/30" : "border-transparent opacity-70",
              )}
              onClick={() => setActiveIndex(index)}
            >
              <img src={image.image_url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
