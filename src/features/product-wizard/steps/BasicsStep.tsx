import type { CategoryAdmin } from "@/features/catalog/api/catalogAdminApi";
import { ProductImageGallery } from "@/features/catalog/components/ProductImageGallery";
import { formatCategoryLabel } from "@/features/catalog/utils/categoryLabel";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ProductWizard } from "../useProductWizard";
import type { WizardImage } from "../types";
import { createId } from "@/shared/lib/utils";

const MAX_IMAGES = 5;

type BasicsStepProps = {
  wizard: ProductWizard;
  categories: CategoryAdmin[];
};

export function BasicsStep({ wizard, categories }: BasicsStepProps) {
  const { state, dispatch } = wizard;

  const handleAddFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const slots = MAX_IMAGES - state.images.length;
    if (slots <= 0) return;
    const images: WizardImage[] = incoming.slice(0, slots).map((file) => ({
      key: `${file.name}-${file.lastModified}-${createId()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    dispatch({ type: "ADD_IMAGES", images });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Foto do produto</Label>
        <ProductImageGallery
          images={[]}
          pendingPreviews={state.images.map((img) => ({ key: img.key, url: img.previewUrl }))}
          onAddFiles={handleAddFiles}
          onRemovePending={(key) => dispatch({ type: "REMOVE_IMAGE", key })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wiz-name">Nome do produto</Label>
        <Input
          id="wiz-name"
          placeholder="Ex: Pizza grande"
          value={state.basics.name}
          onChange={(event) => dispatch({ type: "SET_BASICS", patch: { name: event.target.value } })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wiz-category">Categoria</Label>
        <select
          id="wiz-category"
          className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 text-sm"
          value={state.basics.categoryId}
          onChange={(event) =>
            dispatch({ type: "SET_BASICS", patch: { categoryId: event.target.value } })
          }
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {formatCategoryLabel(category)}
            </option>
          ))}
        </select>
        {!categories.length ? (
          <p className="text-xs text-amber-600">
            Cadastre uma categoria em Categorias antes de criar o produto.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wiz-description">Descrição (opcional)</Label>
        <Input
          id="wiz-description"
          placeholder="Ex: massa artesanal, molho da casa..."
          value={state.basics.description}
          onChange={(event) =>
            dispatch({ type: "SET_BASICS", patch: { description: event.target.value } })
          }
        />
      </div>
    </div>
  );
}
