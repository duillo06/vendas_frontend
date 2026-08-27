import { resolveMediaUrl } from "@/shared/lib/media";

const DEFAULT_FAVICON = "/favicon.svg";

function upsertHeadLink(rel: string, href: string, type?: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  if (type) link.type = type;
  else link.removeAttribute("type");
  // troca o href pra o browser pegar o ícone novo
  link.href = href;
}

/** favicon da aba = logo da loja (fallback no svg padrão) */
export function applyStoreFavicon(logoUrl?: string | null) {
  const href = resolveMediaUrl(logoUrl) || DEFAULT_FAVICON;
  const isSvg = /\.svg(\?|$)/i.test(href) || href.startsWith("data:image/svg");
  upsertHeadLink("icon", href, isSvg ? "image/svg+xml" : undefined);
  upsertHeadLink("shortcut icon", href, isSvg ? "image/svg+xml" : undefined);
  upsertHeadLink("apple-touch-icon", href);
}
