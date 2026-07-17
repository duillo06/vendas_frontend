import { toast } from "sonner";

import type { ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";
import { fireFlowConfetti } from "@/features/flow";

import type { ProductIntentId } from "../intents";
import { AvailabilityIntentFlow, PauseIntentFlow } from "../flows/AvailabilityIntentFlow";
import { CategoryIntentFlow } from "../flows/CategoryIntentFlow";
import {
  CompositionIntentFlow,
  DeleteIntentFlow,
  DuplicateIntentFlow,
} from "../flows/CompositionIntentFlow";
import { DescriptionIntentFlow, NameIntentFlow } from "../flows/DescriptionIntentFlow";
import { ImageIntentFlow } from "../flows/ImageIntentFlow";
import { OptionsIntentFlow } from "../flows/OptionsIntentFlow";
import { PriceIntentFlow } from "../flows/PriceIntentFlow";
type IntentFlowHostProps = {
  product: ProductAdminDetail;
  intent: ProductIntentId;
  onClose: () => void;
};

export function IntentFlowHost({ product, intent, onClose }: IntentFlowHostProps) {
  const handleSuccess = (message?: string) => {
    if (message) toast.success(message);
    fireFlowConfetti();
    onClose();
  };

  const shared = { product, onClose, onSuccess: handleSuccess };

  switch (intent) {
    case "price":
      return <PriceIntentFlow {...shared} />;
    case "image":
      return <ImageIntentFlow {...shared} />;
    case "description":
      return <DescriptionIntentFlow {...shared} />;
    case "name":
      return <NameIntentFlow {...shared} />;
    case "category":
      return <CategoryIntentFlow {...shared} />;
    case "availability":
      return <AvailabilityIntentFlow {...shared} />;
    case "archive":
      return <AvailabilityIntentFlow {...shared} initialMode="archived" />;
    case "pause":
      return <PauseIntentFlow {...shared} />;
    case "composition":
      return <CompositionIntentFlow {...shared} />;
    case "options":
      return <OptionsIntentFlow {...shared} />;
    case "duplicate":
      return <DuplicateIntentFlow {...shared} />;
    case "delete":
      return <DeleteIntentFlow {...shared} />;
    default:
      return null;
  }
}
