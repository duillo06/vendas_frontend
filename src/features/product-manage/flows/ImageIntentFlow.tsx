import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { ProductImageGallery } from "@/features/catalog/components/ProductImageGallery";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

const MAX_IMAGES = 5;

type Pending = { key: string; file: File; previewUrl: string };

export function ImageIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, [pending]);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
  };

  const setPrimary = useMutation({
    mutationFn: (imageId: string) => catalogAdminApi.setPrimaryProductImage(product.id, imageId),
    onSuccess: () => {
      refresh();
      toast.success("Capa atualizada");
    },
  });

  const remove = useMutation({
    mutationFn: (imageId: string) => catalogAdminApi.deleteProductImage(product.id, imageId),
    onSuccess: () => {
      refresh();
      toast.success("Foto removida");
    },
  });

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const room = MAX_IMAGES - product.images.length - pending.length;
    if (room <= 0) {
      toast.error("Limite de 5 fotos.");
      return;
    }
    setPending((current) => [
      ...current,
      ...list.slice(0, room).map((file) => ({
        key: `${file.name}-${file.size}-${Date.now()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const uploadPending = async () => {
    if (!pending.length) {
      onSuccess();
      return;
    }
    setBusy(true);
    try {
      const hasPrimary = product.images.some((image) => image.is_primary);
      for (let index = 0; index < pending.length; index += 1) {
        await catalogAdminApi.uploadProductImage(product.id, pending[index].file, {
          isPrimary: !hasPrimary && index === 0,
        });
      }
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPending([]);
      refresh();
      onSuccess("Fotos atualizadas");
    } catch {
      toast.error("Falha no upload. Tenta de novo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="📷"
      title="Fotos do produto"
      description="Até 5 imagens. A capa é a que aparece no cardápio."
      wide
    >
      <ProductImageGallery
        images={product.images}
        pendingPreviews={pending.map((item) => ({ key: item.key, url: item.previewUrl }))}
        isUploading={busy}
        onAddFiles={addFiles}
        onSetPrimary={(imageId) => setPrimary.mutate(imageId)}
        onDelete={(imageId) => remove.mutate(imageId)}
        onRemovePending={(key) =>
          setPending((current) => {
            const item = current.find((entry) => entry.key === key);
            if (item) URL.revokeObjectURL(item.previewUrl);
            return current.filter((entry) => entry.key !== key);
          })
        }
      />
      <FlowActions
        onCancel={onClose}
        onConfirm={() => void uploadPending()}
        confirmLabel={pending.length ? "Salvar fotos novas" : "Concluir"}
        pending={busy}
      />
    </IntentFlowDialog>
  );
}
