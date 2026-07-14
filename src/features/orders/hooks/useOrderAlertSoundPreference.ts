import { useCallback, useState } from "react";

const STORAGE_KEY = "fs.orderAlertSound";

function readPreference(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true; // ligado por padrão
    return raw !== "false";
  } catch {
    return true;
  }
}

export function useOrderAlertSoundPreference() {
  const [enabled, setEnabled] = useState(readPreference);

  const setSoundEnabled = useCallback((next: boolean) => {
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
    } catch {
      // storage cheio / privado — só mantém na sessão
    }
  }, []);

  const toggle = useCallback(() => {
    setSoundEnabled(!enabled);
    return !enabled;
  }, [enabled, setSoundEnabled]);

  return { enabled, setSoundEnabled, toggle };
}
