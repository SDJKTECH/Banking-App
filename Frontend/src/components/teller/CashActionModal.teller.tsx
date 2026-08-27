// src/components/teller/CashActionModal.teller.tsx
import React, { useState } from "react";
import { CashActionType } from "../../types/tellerUI.types";

interface CashActionModalProps {
  isOpen: boolean;
  initialMode: CashActionType;
  acctNum: string;
  currentBalance: number;
  onClose: () => void;
  onDeposit: (payload: { AcctNum: string; Amount: number; Remarks?: string }) => Promise<any>;
  onWithdraw: (payload: { AcctNum: string; Amount: number; Remarks?: string }) => Promise<any>;
  onTransfer: (payload: { SourceAcctNum: string; DestinationAcctNum: string; Amount: number; Remarks?: string }) => Promise<any>;
}

export const CashActionModalTeller: React.FC<CashActionModalProps> = ({
  isOpen,
  initialMode,
  acctNum,
  currentBalance,
  onClose,
  onDeposit,
  onWithdraw,
  onTransfer,
}) => {
  const [mode, setMode] = useState<CashActionType>(initialMode);
  const [amount, setAmount] = useState<string>("");
  const [destAcct, setDestAcct] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handles typing & auto-spacing cleanly up to 16 digits
  const handleDestAcctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Extract only digits and cap at 16 digits
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 16);
    
    // 2. Format with space every 4 digits (e.g., 1234 5678 9012 3456)
    const formatted = rawDigits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setDestAcct(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = Number(amount);
    const cleanDestAcct = destAcct.replace(/\s+/g, ""); // Strip spaces before API call

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if ((mode === "WITHDRAW" || mode === "TRANSFER") && parsedAmount > currentBalance) {
      setError(`Insufficient balance. Available: ₹${currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
      return;
    }

    if (mode === "TRANSFER") {
      if (!cleanDestAcct || cleanDestAcct.length !== 16) {
        setError("Destination account number must be exactly 16 digits");
        return;
      }
      if (cleanDestAcct === acctNum.replace(/\s+/g, "")) {
        setError("Destination account cannot be the same as the source account");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "DEPOSIT") {
        await onDeposit({
          AcctNum: acctNum.replace(/\s+/g, ""),
          Amount: parsedAmount,
          Remarks: remarks || "Counter Cash Deposit",
        });
      } else if (mode === "WITHDRAW") {
        await onWithdraw({
          AcctNum: acctNum.replace(/\s+/g, ""),
          Amount: parsedAmount,
          Remarks: remarks || "Counter Cash Withdrawal",
        });
      } else if (mode === "TRANSFER") {
          await onTransfer({
            SourceAcctNum: acctNum.replace(/\s+/g, ""),
            DestinationAcctNum: cleanDestAcct,
            Amount: parsedAmount,
            Remarks: remarks || `Transfer to ${cleanDestAcct}`, // 👈 Embeds destination account
          });
      }
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Transaction execution failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Mode Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("DEPOSIT");
              setError(null);
            }}
            className={`py-3.5 text-center transition ${
              mode === "DEPOSIT"
                ? "bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            💵 Deposit Cash
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("WITHDRAW");
              setError(null);
            }}
            className={`py-3.5 text-center transition ${
              mode === "WITHDRAW"
                ? "bg-white text-rose-700 border-b-2 border-rose-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🏧 Cash Dispensation
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("TRANSFER");
              setError(null);
            }}
            className={`py-3.5 text-center transition ${
              mode === "TRANSFER"
                ? "bg-white text-blue-700 border-b-2 border-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            🔁 Assisted Transfer
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Account Summary Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Source Account</span>
              <span className="font-mono font-bold text-slate-800 tracking-wide">
                {acctNum.replace(/(\d{4})(?=\d)/g, "$1 ")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Current Balance</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Transfer Target Input */}
          {mode === "TRANSFER" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Destination Account Number (16 Digits) *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {destAcct.replace(/\s+/g, "").length} / 16 digits
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={19} // 👈 16 digits + 3 spaces = 19 characters
                value={destAcct}
                onChange={handleDestAcctChange}
                placeholder="XXXX XXXX XXXX XXXX"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 ${
                mode === "DEPOSIT"
                  ? "text-emerald-600 focus:ring-emerald-500"
                  : mode === "WITHDRAW"
                  ? "text-rose-600 focus:ring-rose-500"
                  : "text-blue-600 focus:ring-blue-500"
              }`}
            />
          </div>

          {/* Remarks Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Narration / Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={`Counter ${mode.toLowerCase()} narration`}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition shadow-sm disabled:opacity-50 ${
                mode === "DEPOSIT"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : mode === "WITHDRAW"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : `Execute ${mode}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};