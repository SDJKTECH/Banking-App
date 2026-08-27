// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Auth Modes: 'LOGIN' | 'CHANGE_PASSWORD' | 'FORGOT_PASSWORD'
  const [authMode, setAuthMode] = useState<"LOGIN" | "CHANGE_PASSWORD" | "FORGOT_PASSWORD">("LOGIN");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleModeSwitch = (mode: "LOGIN" | "CHANGE_PASSWORD" | "FORGOT_PASSWORD") => {
    resetForm();
    setAuthMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMode === "CHANGE_PASSWORD") {
        if (newPassword.length < 6) {
          setError("New password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("New passwords do not match.");
          setLoading(false);
          return;
        }
        await authService.changePassword({
          Email: email,
          OldPassword: password,
          NewPassword: newPassword,
        });
        setSuccessMsg("Password updated successfully! Please sign in with your new password.");
        setAuthMode("LOGIN");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (authMode === "FORGOT_PASSWORD") {
        await authService.forgotPassword(email);
        setSuccessMsg("If your email is registered, a new temporary password has been dispatched.");
        setAuthMode("LOGIN");
      } else {
        const res = await authService.login({ Email: email, Password: password });
        login(res.data.token, res.data.user);

        if (res.data.user.role === "BANK_TELLER" || res.data.user.role === "ADMIN") {
          navigate("/teller/portal");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Action failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-hidden">
      <style>{`
        @keyframes gridDrift {
          0% { background-position: 0 0; }
          100% { background-position: 64px 64px; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        .vault-grid {
          background-image: linear-gradient(rgba(45,212,191,0.12) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(45,212,191,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
          animation: gridDrift 18s linear infinite;
        }
        .vault-glow {
          animation: glowPulse 6s ease-in-out infinite;
        }
      `}</style>

      {/* Left branding panel */}
      <div className="relative hidden lg:flex lg:w-[46%] flex-col justify-between overflow-hidden bg-[#0B0F1E] px-12 py-12 select-none">
        <div className="absolute inset-0 vault-grid" />
        <div className="vault-glow absolute -top-24 -left-16 w-96 h-96 rounded-full bg-[#2DD4BF] blur-[110px]" />
        <div className="vault-glow absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#F0B429] blur-[110px]" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-[#F8FAFC] font-bold tracking-[0.08em] text-sm uppercase">JKBank</span>
        </div>

        <div className="relative z-10 space-y-5 max-w-sm">
          <h1 className="text-4xl font-bold text-[#F8FAFC] tracking-tight leading-[1.1]">
            Your account,<br />always within reach.
          </h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Every session is encrypted end-to-end and continuously monitored, so you can move money with confidence.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
            256-bit encrypted
          </span>
          <span className="w-px h-3 bg-[#94A3B8]/30" />
          <span>FDIC insured</span>
        </div>
      </div>

      {/* Right scrollable form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 overflow-y-auto max-h-screen">
        <div className="w-full max-w-sm space-y-5 my-auto py-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0B0F1E] tracking-tight">
              {authMode === "LOGIN" && "Welcome back"}
              {authMode === "CHANGE_PASSWORD" && "Set Permanent Password"}
              {authMode === "FORGOT_PASSWORD" && "Reset Password"}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {authMode === "LOGIN" && "Sign in to access your accounts"}
              {authMode === "CHANGE_PASSWORD" && "Replace your temporary teller-issued password"}
              {authMode === "FORGOT_PASSWORD" && "Enter your email to receive temporary login credentials"}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B0F1E]/60 mb-1">
                Email address
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-[#0B0F1E] text-xs focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                />
              </div>
            </div>

            {/* Password Field */}
            {authMode !== "FORGOT_PASSWORD" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B0F1E]/60">
                    {authMode === "CHANGE_PASSWORD" ? "Temporary / Old Password" : "Password"}
                  </label>

                  {authMode === "LOGIN" && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("FORGOT_PASSWORD")}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2 bg-white border border-slate-200 rounded-lg text-[#0B0F1E] text-xs focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0B0F1E] text-xs font-medium transition cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {/* Change Password Sub-Fields */}
            {authMode === "CHANGE_PASSWORD" && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B0F1E]/60 mb-1">
                    New Permanent Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-[#0B0F1E] text-xs focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B0F1E]/60 mb-1">
                    Confirm Permanent Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-[#0B0F1E] text-xs focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                  />
                </div>
              </>
            )}

            {/* Back Button */}
            {authMode !== "LOGIN" && (
              <div className="text-right pt-0.5">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("LOGIN")}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  ← Back to Sign in
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0B0F1E] text-white font-medium rounded-lg text-xs transition hover:bg-slate-800 disabled:bg-slate-600 shadow-sm cursor-pointer"
            >
              {loading
                ? "Processing..."
                : authMode === "LOGIN"
                ? "Sign in"
                : authMode === "CHANGE_PASSWORD"
                ? "Set Permanent Password"
                : "Send Temporary Password"}
            </button>
          </form>

          {/* First-time login callout */}
          {authMode === "LOGIN" && (
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-center space-y-0.5">
              <p className="text-[11px] text-slate-500 font-medium">
                First time logging in with a teller-issued temporary password?
              </p>
              <button
                type="button"
                onClick={() => handleModeSwitch("CHANGE_PASSWORD")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                Set Permanent Password →
              </button>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 border-t border-slate-100 pt-2.5">
            Need a new account? Visit your nearest branch to be onboarded by a Bank Teller.
          </p>
        </div>
      </div>
    </div>
  );
};