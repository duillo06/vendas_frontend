import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { usePermissions } from "../hooks/usePermissions";

type PermissionRouteProps = {
  permission: string;
  children: ReactNode;
  /** pra onde mandar se não tem a permissão */
  fallbackTo?: string;
};

export function PermissionRoute({
  permission,
  children,
  fallbackTo = "/pedidos",
}: PermissionRouteProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <Navigate to={fallbackTo} replace />;
  }

  return children;
}
