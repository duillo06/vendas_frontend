import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user, isLoading } = useAuth();

  const can = (permission: string): boolean => {
    if (!user) return false;
    if (user.is_owner) return true;
    return user.permissions.includes(permission);
  };

  const canAny = (permissions: string[]): boolean => permissions.some(can);

  const canAll = (permissions: string[]): boolean => permissions.every(can);

  return { can, canAny, canAll, isLoading };
}
