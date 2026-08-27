import { resolveMediaUrl } from "@/shared/lib/media";

const DEFAULT_FAVICON = "/favicon.svg";

/** Chrome ignora troca de href no mesmo <link> — remove e cria de novo */
function replaceIconLinks(href: string, type?: string) {
  document
    .querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
    )
    .forEach((el) => el.remove());

  for (const rel of ["icon", "shortcut icon", "apple-touch-icon"] as const) {
    const link = document.createElement("link");
    link.rel = rel;
    if (type && rel !== "apple-touch-icon") link.type = type;
    link.href = href;
    document.head.appendChild(link);
  }
}

/** jpg/png da logo → data URL png (favicon confiável na aba) */
function logoToPngDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (src.startsWith("data:") || /\.svg(\?|$)/i.test(src)) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      // cobre o quadrado centralizado
      const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** favicon da aba = logo da loja (fallback no svg padrão) */
export function applyStoreFavicon(logoUrl?: string | null) {
  const href = resolveMediaUrl(logoUrl) || DEFAULT_FAVICON;
  const isSvg = /\.svg(\?|$)/i.test(href) || href.startsWith("data:image/svg");

  if (isSvg) {
    replaceIconLinks(href, "image/svg+xml");
    return;
  }

  // aplica logo direto já; data URL sobrescreve quando o canvas terminar
  replaceIconLinks(href);

  void logoToPngDataUrl(href).then((dataUrl) => {
    if (dataUrl) replaceIconLinks(dataUrl, "image/png");
  });
}
