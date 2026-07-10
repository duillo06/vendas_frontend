import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "foodservice:favorites";

type FavoritesStore = {
  snapshot: string[];
  raw: string;
};

let store: FavoritesStore = { snapshot: [], raw: "" };
const listeners = new Set<() => void>();

function loadStore(): FavoritesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "[]";
    if (raw === store.raw) {
      return store;
    }

    const parsed = JSON.parse(raw) as unknown;
    const snapshot = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];

    store = { snapshot, raw };
    return store;
  } catch {
    store = { snapshot: [], raw: "[]" };
    return store;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  loadStore();
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return loadStore().snapshot;
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, () => [] as string[]);

  const toggle = useCallback((productId: string) => {
    const current = getSnapshot();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}
