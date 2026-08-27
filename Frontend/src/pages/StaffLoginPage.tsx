// src/components/StaffLoginPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    <path d="M9.5 12l1.8 1.8L15 10" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
    <path d="M10.3 3.9l-8 14A1.8 1.8 0 0 0 3.9 21h16.2a1.8 1.8 0 0 0 1.6-2.7l-8-14a1.8 1.8 0 0 0-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13.5" />
    <line x1="12" y1="16.5" x2="12" y2="16.6" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    {open ? (
      <>
        <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a17 17 0 0 1-3.1 4M6.6 6.6C3.9 8.3 1.5 12 1.5 12S5 19 12 19a10.9 10.9 0 0 0 3.4-.5" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    )}
  </svg>
);

export const StaffLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [clock, setClock] = useState(new Date());

  const { login } = useAuth();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login({ Email: email, Password: password });
      const user = res.data.user;

      if (user.role !== "BANK_TELLER" && user.role !== "ADMIN") {
        setError("Access denied. This terminal is restricted to bank tellers and staff.");
        triggerShake();
        return;
      }

      login(res.data.token, user);
      navigate("/teller/portal");
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Invalid staff credentials. Check and try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const timeStr = clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = clock.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-[#0B1220]">
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes gridPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.6; } }
        @keyframes shakeX {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .scanline { animation: scanline 4.5s linear infinite; }
        .grid-pulse { animation: gridPulse 3.5s ease-in-out infinite; }
        .shake-anim { animation: shakeX 0.4s linear; }
        @media (prefers-reduced-motion: reduce) {
          .scanline, .grid-pulse { animation: none; }
        }
      `}</style>

      {/* Left: terminal panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden px-12 py-10 text-slate-200">
        <div
          className="absolute inset-0 grid-pulse"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,116,144,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(14,116,144,0.18) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-24 scanline bg-gradient-to-b from-teal-400/10 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-2 text-xs font-mono tracking-wider text-teal-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.6)]" />
          JKB SECURE TERMINAL
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <ShieldIcon />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Staff &amp; teller
            <br />
            access terminal
          </h1>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Session activity on this terminal is logged and monitored under bank compliance policy.
          </p>
        </div>

        <div className="relative flex items-end justify-between font-mono text-xs text-slate-500 border-t border-slate-700/60 pt-4">
          <div>
            <p className="text-slate-500">{dateStr}</p>
            <p className="text-teal-400 text-base tracking-widest">{timeStr}</p>
          </div>
          <p className="uppercase tracking-widest text-amber-400/80 border border-amber-500/30 bg-amber-500/10 rounded px-2 py-1">
            Clearance required
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
        <div
          className={`w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6 ${
            shake ? "shake-anim" : ""
          }`}
        >
          <div className="space-y-2">
            <div className="lg:hidden inline-flex p-2.5 bg-teal-50 rounded-xl text-teal-700 border border-teal-200">
              <ShieldIcon />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to your terminal</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 py-1 px-2.5 rounded-full inline-block border border-amber-200">
              Authorized personnel only
            </p>
          </div>

          {error && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5"
            >
              <span className="text-rose-500 mt-0.5"><AlertIcon /></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="staff-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Staff email address
              </label>
              <input
                id="staff-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teller@jkbank.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Staff password
              </label>
              <div className="relative">
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockOn(e.getModifierState?.("CapsLock") ?? false)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {capsLockOn && (
                <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1">
                  <AlertIcon /> Caps Lock is on
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-teal-700 disabled:bg-slate-400 text-white font-semibold rounded-lg text-sm transition-colors shadow-md flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Verifying credentials…
                </>
              ) : (
                "Sign in to teller terminal"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Are you a bank customer?{" "}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Go to customer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};