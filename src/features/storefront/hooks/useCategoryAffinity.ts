import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "foodservice:category-affinity";

type AffinityMap = Record<string, number>;

type AffinityStore = {
  snapshot: AffinityMap;
  raw: string;
};

let store: AffinityStore = { snapshot: {}, raw: "" };
const listeners = new Set<() => void>();

function loadStore(): AffinityStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "{}";
    if (raw === store.raw) return store;
    const parsed = JSON.parse(raw) as unknown;
    const snapshot: AffinityMap = {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
        const n = Number(value);
        if (id && Number.isFinite(n) && n > 0) snapshot[id] = n;
      }
    }
    store = { snapshot, raw };
    return store;
  } catch {
    store = { snapshot: {}, raw: "{}" };
    return store;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  loadStore();
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return loadStore().snapshot;
}

function persist(next: AffinityMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitChange();
}

/** sinal local: categorias que o cliente mais visita / pede */
export function useCategoryAffinity() {
  const affinity = useSyncExternalStore(subscribe, getSnapshot, () => ({} as AffinityMap));

  const record = useCallback((categoryId: string, weight = 1) => {
    if (!categoryId) return;
    const current = getSnapshot();
    persist({
      ...current,
      [categoryId]: (current[categoryId] ?? 0) + weight,
    });
  }, []);

  const preferredCategoryIds = Object.entries(affinity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  return { affinity, record, preferredCategoryIds };
}

/** registra visita uma vez por mount da página de categoria */
export function useRecordCategoryVisit(categoryId: string | undefined) {
  const { record } = useCategoryAffinity();
  useEffect(() => {
    if (!categoryId) return;
    record(categoryId, 1);
  }, [categoryId, record]);
}
