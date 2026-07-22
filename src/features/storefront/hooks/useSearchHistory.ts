import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "foodservice:search-history";
const MAX_ITEMS = 8;

type HistoryStore = {
  snapshot: string[];
  raw: string;
};

let store: HistoryStore = { snapshot: [], raw: "" };
const listeners = new Set<() => void>();

function loadStore(): HistoryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "[]";
    if (raw === store.raw) return store;

    const parsed = JSON.parse(raw) as unknown;
    const snapshot = Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
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

function persist(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitChange();
}

/** histórico local da busca dedicada */
export function useSearchHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, () => [] as string[]);

  const push = useCallback((term: string) => {
    const cleaned = term.trim();
    if (cleaned.length < 2) return;
    const current = getSnapshot();
    const next = [cleaned, ...current.filter((t) => t.toLowerCase() !== cleaned.toLowerCase())].slice(
      0,
      MAX_ITEMS,
    );
    persist(next);
  }, []);

  const remove = useCallback((term: string) => {
    persist(getSnapshot().filter((t) => t !== term));
  }, []);

  const clear = useCallback(() => {
    persist([]);
  }, []);

  return { history, push, remove, clear };
}
