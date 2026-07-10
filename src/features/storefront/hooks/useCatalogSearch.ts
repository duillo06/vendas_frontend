import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

/** busca do cardápio com debounce e ?q= na URL */
export function useCatalogSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setSearch(urlQuery);
    setDebouncedSearch(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const next = debouncedSearch.trim();
    const current = searchParams.get("q") ?? "";

    if (next === current) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  return { search, setSearch, debouncedSearch };
}
