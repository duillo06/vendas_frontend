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

function persist(next: string[]) {
  const raw = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, raw);
  store = { snapshot: next, raw };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
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
    persist(next);
  }, []);

  // tira IDs que não existem mais no cardápio (ex.: após re-seed)
  const prune = useCallback((validIds: Iterable<string>) => {
    const valid = new Set(validIds);
    const current = getSnapshot();
    if (!current.length) return;
    const next = current.filter((id) => valid.has(id));
    if (next.length === current.length) return;
    persist(next);
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites],
  );

  return { favorites, toggle, prune, isFavorite };
}
