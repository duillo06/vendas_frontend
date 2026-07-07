import type { ReactNode } from "react";

import { usePermissions } from "../hooks/usePermissions";

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  return can(permission) ? children : fallback;
}
