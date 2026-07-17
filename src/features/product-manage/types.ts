import type { ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";
import type { ProductIntentId } from "./intents";

export type ProductManageCallbacks = {
  onDone: () => void;
  onRefresh: () => void;
};

export type IntentFlowProps = {
  product: ProductAdminDetail;
  onClose: () => void;
  onSuccess: (message?: string) => void;
};

export type ActiveIntent = ProductIntentId | null;
