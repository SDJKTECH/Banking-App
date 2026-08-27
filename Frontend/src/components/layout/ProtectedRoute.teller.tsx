// src/components/layout/ProtectedRoute.teller.tsx
import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRouteTeller: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/staff/login" replace />;
  }

  if (user.role !== "BANK_TELLER" && user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};