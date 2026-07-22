/** compara cidade sem acento / case — espelha o backend */
export function normalizeCity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeState(value: string): string {
  return value.trim().toUpperCase().slice(0, 2);
}

export function citiesMatch(a: string, b: string): boolean {
  const left = normalizeCity(a);
  const right = normalizeCity(b);
  return Boolean(left) && left === right;
}

export function isInDeliveryArea(params: {
  city: string;
  state: string;
  deliveryCity?: string | null;
  deliveryState?: string | null;
}): boolean {
  const storeCity = (params.deliveryCity || "").trim();
  const storeState = normalizeState(params.deliveryState || "");
  if (!storeCity || !storeState) return true;
  return (
    citiesMatch(params.city, storeCity) && normalizeState(params.state) === storeState
  );
}

/** 7 casas — cabe no DecimalField(max_digits=10) sem ruído de float */
export function roundGeoCoordinate(value: number): number {
  return Math.round(value * 1e7) / 1e7;
}
