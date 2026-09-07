/** CSS só da comanda — documento isolado pra térmica não puxar folha A4 */
const COMANDA_IFRAME_CSS = `
  @page {
    margin: 0;
    size: auto;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: auto;
    height: auto;
    min-height: 0;
    background: #fff;
    color: #000;
  }
  body {
    padding: 2mm;
  }
  .order-comanda-print {
    display: block;
    width: 72mm;
    max-width: 100%;
    margin: 0;
    padding: 0;
    color: #000;
    background: #fff;
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .order-comanda-print[data-paper="58"] {
    width: 48mm;
    font-size: 10px;
  }
  .order-comanda-print[data-font="large"] {
    font-size: 13px;
    line-height: 1.4;
  }
  .order-comanda-print[data-paper="58"][data-font="large"] {
    font-size: 11px;
  }
  .comanda-copy + .comanda-copy {
    page-break-before: always;
    break-before: page;
    margin-top: 8px;
  }
  .comanda-header { text-align: center; margin-bottom: 6px; }
  .comanda-store {
    font-size: 1.15em;
    font-weight: 700;
    text-transform: uppercase;
    word-break: break-word;
  }
  .comanda-title { margin-top: 4px; font-size: 1em; letter-spacing: 0.12em; }
  .comanda-number {
    margin-top: 2px;
    font-size: 1.7em;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .comanda-meta { margin-top: 2px; font-size: 0.95em; }
  .comanda-center { text-align: center; }
  .comanda-via { margin-top: 4px; font-weight: 700; letter-spacing: 0.08em; }
  .comanda-badge {
    text-align: center;
    font-size: 1.15em;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 4px 0;
  }
  .comanda-rule { border-top: 1px dashed #000; margin: 6px 0; }
  .comanda-block { margin: 0; }
  .comanda-section-title { font-weight: 700; margin-bottom: 4px; }
  .comanda-address { margin-top: 4px; }
  .comanda-items { list-style: none; margin: 0; padding: 0; }
  .comanda-item { margin-bottom: 8px; }
  .comanda-item-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-weight: 700;
  }
  .comanda-item-row span:last-child { white-space: nowrap; }
  .comanda-unit { padding-left: 8px; font-size: 0.9em; font-weight: 400; }
  .comanda-options {
    list-style: none;
    margin: 2px 0 0;
    padding: 0 0 0 8px;
    font-weight: 400;
    font-size: 0.92em;
  }
  .comanda-obs {
    margin-top: 2px;
    padding-left: 8px;
    font-weight: 700;
    font-size: 0.95em;
  }
  .comanda-totals .comanda-total {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #000;
    font-size: 1.15em;
  }
  .comanda-footer { text-align: center; margin-top: 8px; font-size: 1em; }
  p { margin: 0; }
`;

/**
 * Imprime só a comanda num iframe — evita página alta do painel
 * (min-h-screen) que faz a térmica puxar metro de papel em branco.
 */
export function printComandaFromElement(source: HTMLElement | null) {
  if (!source) return;

  const paper = source.getAttribute("data-paper") ?? "80";
  const font = source.getAttribute("data-font") ?? "normal";
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.display = "block";
  clone.setAttribute("data-paper", paper);
  clone.setAttribute("data-font", font);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Impressão da comanda");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Comanda</title>
  <style>${COMANDA_IFRAME_CSS}</style>
</head>
<body>${clone.outerHTML}</body>
</html>`);
  doc.close();

  const cleanup = () => {
    iframe.remove();
  };

  const runPrint = () => {
    try {
      win.focus();
      win.print();
    } finally {
      // dá tempo do diálogo abrir antes de remover o iframe
      window.setTimeout(cleanup, 1000);
    }
  };

  // alguns browsers precisam de um tick pra layoutar o iframe
  if (doc.readyState === "complete") {
    window.setTimeout(runPrint, 50);
  } else {
    iframe.addEventListener("load", () => window.setTimeout(runPrint, 50), { once: true });
  }
}
