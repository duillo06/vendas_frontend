import { useCallback, useState } from "react";

const STORAGE_KEY = "flow.onboarding.done";

// Controla o onboarding do Flow: aparece só na primeira vez e pode ser ignorado.
export function useFlowOnboarding() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignora se o storage estiver indisponível
    }
    setOpen(false);
  }, []);

  const reopen = useCallback(() => setOpen(true), []);

  return { open, dismiss, reopen };
}
