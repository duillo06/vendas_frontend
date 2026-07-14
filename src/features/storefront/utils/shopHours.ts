import type { BusinessHoursPublic, CompanyPublic } from "@/features/company/types/company.types";

/** backend usa weekday Python: 0=segunda … 6=domingo */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** "Abre às 18:00" a partir da grade de horários */
export function getNextOpenLabel(
  company?: CompanyPublic | null,
  now = new Date(),
): string | null {
  const hours = company?.business_hours;
  if (!hours?.length) return null;

  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const day = mondayIndex(d);
    const row = byDay.get(day);
    if (!row || row.is_closed || !row.opens_at) continue;

    if (offset === 0) {
      const opens = parseTodayTime(row.opens_at, now);
      if (opens && opens.getTime() > now.getTime()) {
        return `Abre às ${formatHm(row.opens_at)}`;
      }
      continue;
    }

    const label = offset === 1 ? "amanhã" : row.day_name;
    return `Abre ${label} às ${formatHm(row.opens_at)}`;
  }

  return null;
}

function parseTodayTime(hm: string, base: Date): Date | null {
  const [h, m] = hm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function formatHm(hm: string): string {
  const [h, m] = hm.split(":");
  return `${h}:${m ?? "00"}`;
}

export function deliveryWindowLabel(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const min = Math.max(15, minutes - 10);
  const max = minutes + 5;
  return `${min}-${max} min`;
}

export type ShopMetaParts = {
  rating?: string;
  time?: string;
  mode?: string;
  minOrder?: string;
  fee?: string;
};

export function buildShopMetaLine(
  parts: ShopMetaParts,
): string {
  return [parts.rating, parts.time, parts.mode, parts.minOrder, parts.fee]
    .filter(Boolean)
    .join(" · ");
}

export function findTodayHours(
  hours: BusinessHoursPublic[] | undefined,
  now = new Date(),
): BusinessHoursPublic | null {
  if (!hours?.length) return null;
  const day = mondayIndex(now);
  return hours.find((h) => h.day_of_week === day) ?? null;
}
