import { DEFAULT_THEME } from "../constants/defaults";
import type { TenantTheme } from "../types/settings.types";

type Hsl = { h: number; s: number; l: number };

const THEME_VAR_KEYS = [
  "primary",
  "primary-foreground",
  "accent",
  "accent-foreground",
  "primary-soft",
  "primary-muted",
  "accent-soft",
  "hero-from",
  "hero-to",
  "sidebar-from",
  "sidebar-to",
  "surface",
  "surface-accent",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "radius",
] as const;

export function parseHslComponents(hsl: string): Hsl | null {
  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) return null;
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

export function formatHslComponents({ h, s, l }: Hsl): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function shiftHue(hsl: Hsl, degrees: number): Hsl {
  return { ...hsl, h: (hsl.h + degrees + 360) % 360 };
}

export function deriveThemeTokens(theme?: TenantTheme | null) {
  const base = parseHslComponents(theme?.primary ?? DEFAULT_THEME.primary);
  if (!base) {
    return null;
  }

  const accentBase = theme?.accent
    ? parseHslComponents(theme.accent)
    : shiftHue({ ...base, s: Math.min(base.s, 78), l: Math.min(base.l + 8, 52) }, 32);

  const accent = accentBase ?? base;

  const primarySoft: Hsl = { h: base.h, s: Math.min(base.s * 0.4, 42), l: 96 };
  const primaryMuted: Hsl = { h: base.h, s: Math.min(base.s * 0.5, 48), l: 92 };
  const accentSoft: Hsl = { h: accent.h, s: Math.min(accent.s * 0.4, 42), l: 96 };
  const heroFrom: Hsl = { h: base.h, s: base.s, l: Math.max(base.l - 5, 26) };
  const heroTo: Hsl = shiftHue(
    { h: base.h, s: Math.min(base.s + 4, 90), l: Math.min(base.l + 3, 46) },
    16,
  );
  const sidebarFrom: Hsl = { h: base.h, s: Math.min(base.s * 0.55, 58), l: 17 };
  const sidebarTo: Hsl = { h: 220, s: 25, l: 11 };

  return {
    primary: formatHslComponents(base),
    "primary-foreground": theme?.primary_foreground ?? DEFAULT_THEME.primary_foreground,
    accent: formatHslComponents(accent),
    "accent-foreground": theme?.accent_foreground ?? DEFAULT_THEME.accent_foreground,
    "primary-soft": formatHslComponents(primarySoft),
    "primary-muted": formatHslComponents(primaryMuted),
    "accent-soft": formatHslComponents(accentSoft),
    "hero-from": formatHslComponents(heroFrom),
    "hero-to": formatHslComponents(heroTo),
    "sidebar-from": formatHslComponents(sidebarFrom),
    "sidebar-to": formatHslComponents(sidebarTo),
    surface: formatHslComponents(primarySoft),
    "surface-accent": formatHslComponents(accentSoft),
    "chart-1": formatHslComponents(base),
    "chart-2": formatHslComponents(accent),
    "chart-3": formatHslComponents(shiftHue(base, 52)),
    "chart-4": formatHslComponents(shiftHue(base, 128)),
    radius: theme?.radius ?? DEFAULT_THEME.radius,
  };
}

export function applyTenantTheme(theme?: TenantTheme | null) {
  const tokens = deriveThemeTokens(theme ?? DEFAULT_THEME);
  if (!tokens) return;

  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${key}`, value);
  }
}

export function resetTenantTheme() {
  applyTenantTheme(DEFAULT_THEME);
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
  const parsed = parseHslComponents(hsl);
  if (!parsed) return null;
  return parsed.l / 100;
}

export function hasLowContrast(primary: string, foreground: string): boolean {
  const primaryL = parseHslLuminance(primary);
  const foregroundL = parseHslLuminance(foreground);
  if (primaryL === null || foregroundL === null) {
    return false;
  }
  return Math.abs(primaryL - foregroundL) < 0.35;
}

export { THEME_VAR_KEYS };
