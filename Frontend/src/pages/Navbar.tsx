// src/pages/Navbar.tsx
import React from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStaff =
    isAuthenticated && user && (user.role === "BANK_TELLER" || user.role === "ADMIN");

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                🏦
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                JK<span className="text-blue-500">Bank</span>
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                {!isStaff && (
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {isStaff && (
                  <Link
                    to="/teller/portal"
                    className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>🛡️</span> Teller Terminal
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-100">
                    {user.customerName || user.email}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {user.custId}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-400 bg-red-950/40 hover:bg-red-900/60 rounded-lg transition-colors border border-red-800/60"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Customer Sign In
                </Link>

                {/* Staff Portal Link */}
                <Link
                  to="/staff/login"
                  className="px-3.5 py-2 text-sm font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>🛡️</span> Staff Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};