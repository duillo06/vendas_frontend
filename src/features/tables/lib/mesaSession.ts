import type { MesaSession } from "../types/table.types";

const KEY = "fs_mesa_session";

export function getMesaSession(): MesaSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MesaSession;
  } catch {
    return null;
  }
}

export function setMesaSession(session: MesaSession): void {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearMesaSession(): void {
  sessionStorage.removeItem(KEY);
}
