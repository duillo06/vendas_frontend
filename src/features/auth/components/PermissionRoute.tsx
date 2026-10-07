import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { usePermissions } from "../hooks/usePermissions";

type PermissionRouteProps = {
  permission?: string;
  /** qualquer uma dessas permissões basta */
  anyOf?: string[];
  children: ReactNode;
  /** pra onde mandar se não tem a permissão */
  fallbackTo?: string;
};

export function PermissionRoute({
  permission,
  anyOf,
  children,
  fallbackTo = "/pedidos",
}: PermissionRouteProps) {
  const { can, canAny } = usePermissions();

  const allowed = anyOf?.length
    ? canAny(anyOf)
    : permission
      ? can(permission)
      : false;

  if (!allowed) {
    return <Navigate to={fallbackTo} replace />;
  }

  return children;
}
