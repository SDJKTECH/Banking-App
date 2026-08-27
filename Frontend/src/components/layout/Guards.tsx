// src/components/layout/Guards.tsx
import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[70vh]">
    <div className="w-9 h-9 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * 🔒 Customer Guard:
 * Restricts access strictly to authenticated CUSTOMER role accounts.
 */
export const CustomerRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect staff users trying to access customer dashboard
  if (user.role === "BANK_TELLER" || user.role === "ADMIN") {
    return <Navigate to="/teller/portal" replace />;
  }

  return <Outlet />;
};

/**
 * 🛡️ Staff Guard (Teller & Admin):
 * Restricts access to authenticated BANK_TELLER or ADMIN users.
 */
export const StaffRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/staff/login" replace />;
  }

  if (user.role !== "BANK_TELLER" && user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

/**
 * 👑 Strict Admin Guard:
 * Restricts access exclusively to ADMIN users (e.g. KYC queues & customer deletion).
 */
export const StrictAdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/staff/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/teller/portal" replace />;
  }

  return <Outlet />;
};

/**
 * 🔓 Public-Only Guard:
 * Redirects logged-in users away from login/register pages.
 */
export const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated && user) {
    if (user.role === "BANK_TELLER" || user.role === "ADMIN") {
      return <Navigate to="/teller/portal" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};