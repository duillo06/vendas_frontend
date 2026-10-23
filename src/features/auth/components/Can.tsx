import type { ReactNode } from "react";

import { usePermissions } from "../hooks/usePermissions";

type CanProps = {
  permission?: string;
  anyOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, anyOf, children, fallback = null }: CanProps) {
  const { can, canAny } = usePermissions();
  const allowed = anyOf?.length
    ? canAny(anyOf)
    : permission
      ? can(permission)
      : false;
  return allowed ? children : fallback;
}
