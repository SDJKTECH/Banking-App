// src/pages/NotFoundPage.tsx
import React from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

export const NotFoundPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const homePath = !isAuthenticated
    ? "/login"
    : user?.role === "BANK_TELLER" || user?.role === "ADMIN"
    ? "/teller/portal"
    : "/dashboard";

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center text-3xl font-black mb-4">
        404
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The page you are looking for does not exist or you do not have permission to access it.
      </p>
      <Link
        to={homePath}
        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition shadow"
      >
        Return to Home
      </Link>
    </div>
  );
};