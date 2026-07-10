export { ProductBuilder, scrollToOptionGroup } from "./ProductBuilder";
export { ProductBuilderProgress } from "./ProductBuilderProgress";
export { calculateProductPrice, formatOptionPriceModifier } from "./pricingEngine";
export { getGroupGuidance } from "./guidance";
export { computeBuilderProgress } from "./progress";
export { resolveDisplayType } from "./resolveDisplayType";
export { buildInitialSelections } from "./defaults";
export { getVisibleGroups, isGroupVisible, pruneHiddenSelections } from "./visibility";
export {
  validateAllGroups,
  validateGroup,
  flattenSelectionsForCart,
  countGroupSelections,
} from "./validation";
export type {
  BuilderProgress,
  GroupGuidance,
  OptionSelectionItem,
  ProductBuilderState,
} from "./types";
