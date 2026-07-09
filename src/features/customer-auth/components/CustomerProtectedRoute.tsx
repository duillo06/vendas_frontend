import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useCustomerAuth } from "../hooks/useCustomerAuth";

type CustomerProtectedRouteProps = {
  children: ReactNode;
};

export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return children;
}
