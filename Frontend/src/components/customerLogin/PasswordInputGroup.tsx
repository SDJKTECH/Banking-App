// src/components/auth/PasswordInputGroup.tsx
import React, { useState } from "react";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  authMode: "LOGIN" | "CHANGE_PASSWORD";
  onToggleMode: () => void;
}

export const PasswordInputGroup: React.FC<PasswordInputProps> = ({
  label = "Password",
  value,
  onChange,
  placeholder = "••••••••",
  authMode,
  onToggleMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#0B0F1E]/60">
          {label}
        </label>
        {authMode === "LOGIN" ? (
          <button
            type="button"
            onClick={onToggleMode}
            className="text-xs font-medium text-[#0B0F1E]/50 hover:text-[#2DD4BF] transition"
          >
            Change Password?
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleMode}
            className="text-xs font-medium text-[#0B0F1E]/50 hover:text-[#2DD4BF] transition"
          >
            ← Back to Sign In (Forgot?)
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
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-[#0B0F1E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0B0F1E] transition"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};