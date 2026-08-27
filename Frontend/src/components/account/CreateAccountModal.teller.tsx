// src/components/account/CreateAccountModal.teller.tsx
import React, { useState } from "react";

interface CreateAccountModalProps {
  isOpen: boolean;
  custId: string;
  customerName?: string;
  onClose: () => void;
  onSubmit: (payload: {
    CustID: string;
    AccountType: "SAVING" | "LOAN";
    InitialDeposit?: number;
    BranchCode?: string;
    IFSCCode?: string;
  }) => Promise<any>;
}

export const CreateAccountModalTeller: React.FC<CreateAccountModalProps> = ({
  isOpen,
  custId,
  customerName,
  onClose,
  onSubmit,
}) => {
  const [accountType, setAccountType] = useState<"SAVING" | "LOAN">("SAVING");
  const [initialDeposit, setInitialDeposit] = useState<string>("1000");
  const [branchCode, setBranchCode] = useState<string>("BR001");
  const [ifscCode, setIfscCode] = useState<string>("JKBK0000001");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        CustID: custId,
        AccountType: accountType,
        InitialDeposit: accountType === "SAVING" ? Number(initialDeposit) || 0 : 0,
        BranchCode: branchCode,
        IFSCCode: ifscCode,
      });
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to open account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Open Additional Account</h3>
            <p className="text-xs font-mono text-slate-500">{customerName || custId}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType("SAVING")}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  accountType === "SAVING"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Savings Account
              </button>
              <button
                type="button"
                onClick={() => setAccountType("LOAN")}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  accountType === "LOAN"
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Loan Account
              </button>
            </div>
          </div>

          {/* Initial Deposit for Savings */}
          {accountType === "SAVING" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Opening Deposit (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* Branch & IFSC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Confirm & Open Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};