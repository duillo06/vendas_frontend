import { ImagePlus, Star, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type ProductGalleryImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

type ProductImageGalleryProps = {
  images: ProductGalleryImage[];
  pendingPreviews?: Array<{ key: string; url: string }>;
  maxImages?: number;
  isUploading?: boolean;
  onAddFiles: (files: FileList | File[]) => void;
  onSetPrimary?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  onRemovePending?: (key: string) => void;
};

const MAX_IMAGES = 5;

export function ProductImageGallery({
  images,
  pendingPreviews = [],
  maxImages = MAX_IMAGES,
  isUploading = false,
  onAddFiles,
  onSetPrimary,
  onDelete,
  onRemovePending,
}: ProductImageGalleryProps) {
  const totalCount = images.length + pendingPreviews.length;
  const canAddMore = totalCount < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              "group relative h-28 w-28 overflow-hidden rounded-xl border-2 bg-[hsl(var(--muted))]",
              image.is_primary ? "border-brand shadow-md" : "border-[hsl(var(--border))]",
            )}
          >
            <img src={image.image_url} alt="" className="h-full w-full object-cover" />
            {image.is_primary ? (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold">
                <Star className="h-3 w-3" />
                Capa
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              {!image.is_primary && onSetPrimary ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 flex-1 border-white/40 bg-white/90 px-1 text-[10px]"
                  onClick={() => onSetPrimary(image.id)}
                >
                  Capa
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 shrink-0 border-white/40 bg-white/90 p-0 text-red-600"
                  onClick={() => onDelete(image.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}

        {pendingPreviews.map((preview) => (
          <div
            key={preview.key}
            className="relative h-28 w-28 overflow-hidden rounded-xl border-2 border-dashed border-brand-soft bg-[hsl(var(--muted))]"
          >
            <img src={preview.url} alt="" className="h-full w-full object-cover opacity-90" />
            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
              Nova
            </span>
            {onRemovePending ? (
              <button
                type="button"
                className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5 text-white"
                onClick={() => onRemovePending(preview.key)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ))}

        {canAddMore ? (
          <label
            className={cn(
              "flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--muted-foreground))] transition hover:border-brand-soft hover:bg-brand-soft/30",
              isUploading && "pointer-events-none opacity-60",
            )}
          >
            <ImagePlus className="h-7 w-7" />
            <span className="px-2 text-center text-[10px] font-medium">Adicionar</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={isUploading}
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) {
                  onAddFiles(files);
                }
                event.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        {totalCount}/{maxImages} fotos · escolha qual é a capa (aparece no cardápio)
      </p>
    </div>
  );
}
