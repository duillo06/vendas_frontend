/** Converte URL de mídia pra mesma origem do front (evita localhost:8001 no browser). */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // data: / blob: etc.
  if (/^(data|blob):/i.test(url)) return url;

  try {
    if (url.startsWith("/media/") || url.startsWith("/media?")) {
      return url;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/media/")) {
        // path relativo → Vite proxy (:5174/:5175) ou nginx em prod
        return `${parsed.pathname}${parsed.search}`;
      }
      return url;
    }

    // path sem barra inicial
    if (url.startsWith("media/")) {
      return `/${url}`;
    }
  } catch {
    return url;
  }

  return url;
}
