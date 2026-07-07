import type { TenantTheme } from "../types/settings.types";

export function applyTenantTheme(theme?: TenantTheme | null) {
  if (!theme?.primary) {
    return;
  }

  document.documentElement.style.setProperty("--primary", theme.primary);

  if (theme.primary_foreground) {
    document.documentElement.style.setProperty("--primary-foreground", theme.primary_foreground);
  }

  if (theme.radius) {
    document.documentElement.style.setProperty("--radius", theme.radius);
  }
}

export function hexToHslComponents(hex: string): string | null {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) {
      h += 360;
    }
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslComponentsToHex(hsl: string): string | null {
  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) {
    return null;
  }

  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return `#${gray.toString(16).padStart(2, "0").repeat(3)}`;
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function parseHslLuminance(hsl: string): number | null {
  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) {
    return null;
  }
  return Number(match[3]) / 100;
}

export function hasLowContrast(primary: string, foreground: string): boolean {
  const primaryL = parseHslLuminance(primary);
  const foregroundL = parseHslLuminance(foreground);
  if (primaryL === null || foregroundL === null) {
    return false;
  }
  return Math.abs(primaryL - foregroundL) < 0.35;
}
