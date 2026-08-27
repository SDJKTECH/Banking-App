// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./pages/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { StaffLoginPage } from "./pages/StaffLoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TellerPortal } from "./pages/TellerPortal";
import { AdminCustomerPanel } from "./components/admin/AdminCustomerPanel";
import { NotFoundPage } from "./pages/NotFoundPage";

// Guards
import {
  CustomerRoute,
  StaffRoute,
  StrictAdminRoute,
  PublicOnlyRoute,
} from "./components/layout/Guards";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
          <Navbar />
          
          <main className="flex-1 min-h-0 w-full overflow-hidden relative">
            <Routes>
              {/* Default Index Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 🔓 Public Guest Routes (Customer registration route removed) */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/staff/login"
                element={
                  <PublicOnlyRoute>
                    <StaffLoginPage />
                  </PublicOnlyRoute>
                }
              />

              {/* 🔒 Protected Customer Routes */}
              <Route element={<CustomerRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>

              {/* 🛡️ Protected Staff / Teller Portal */}
              <Route element={<StaffRoute />}>
                <Route path="/teller/portal" element={<TellerPortal />} />
              </Route>

              {/* 👑 Strict Admin Panel */}
              <Route element={<StrictAdminRoute />}>
                <Route
                  path="/admin/customers"
                  element={
                    <div className="p-8 h-full overflow-y-auto">
                      <AdminCustomerPanel />
                    </div>
                  }
                />
              </Route>

              {/* 404 Catch-All Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}