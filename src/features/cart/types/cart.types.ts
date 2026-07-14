export interface CartSelectedOption {
  optionId: string;
  optionGroupId: string;
  optionGroupName: string;
  name: string;
  priceModifier: number;
  priceType: "fixed" | "percentage";
  quantity: number;
}

// parte escolhida numa composição (ex: 2º sabor da pizza)
export interface CartComponent {
  productId: string;
  productName: string;
  imageUrl: string | null;
  basePrice: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  selectedOptions: CartSelectedOption[];
  components?: CartComponent[];
}

export type AddToCartPayload = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
};

export const MAX_CART_QUANTITY = 99;
