// src/components/loan/PayEMIModal.teller.tsx
import React, { useState, useEffect } from "react";
import { PayEMIPayload } from "../../types/teller.types";

interface PayEMIModalProps {
  isOpen: boolean;
  acctNum: string;
  remainingBalance: number;
  customerName?: string;
  rateOfInterest?: number;
  loanDuration?: number;
  onClose: () => void;
  onPayEMI: (payload: PayEMIPayload) => Promise<any>;
}

export const PayEMIModalTeller: React.FC<PayEMIModalProps> = ({
  isOpen,
  acctNum,
  remainingBalance,
  customerName,
  rateOfInterest = 8.5,
  loanDuration = 60,
  onClose,
  onPayEMI,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-calculate and pre-fill the estimated EMI installment on open
  useEffect(() => {
    if (isOpen && remainingBalance > 0) {
      const p = remainingBalance;
      const r = (rateOfInterest || 8.5) / 12 / 100;
      const n = loanDuration || 60;

      const calculatedEmi =
        r === 0
          ? p / n
          : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      const defaultInstallment = Math.min(
        Number(calculatedEmi.toFixed(2)),
        remainingBalance
      );

      setAmount(defaultInstallment.toString());
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, remainingBalance, rateOfInterest, loanDuration]);

  if (!isOpen) return null;

  // Reset form state and invoke close callback
  const handleClose = () => {
    setAmount("");
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid repayment amount greater than 0.");
      return;
    }

    if (parsedAmount > remainingBalance) {
      setError(`Amount exceeds total outstanding balance of ₹${remainingBalance.toLocaleString("en-IN")}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await onPayEMI({
        AcctNum: acctNum,
        Amount: parsedAmount,
      });

      // Extract new outstanding balance from response if returned, or calculate locally
      const updatedBalance = res?.data?.remainingBalance ?? (remainingBalance - parsedAmount);

      setSuccessMessage(`EMI payment received. Outstanding balance: ₹${updatedBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}.`);
      setAmount("");
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to record EMI payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-amber-500 text-slate-950 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">Counter EMI Collection</h3>
            <p className="text-xs text-slate-800 font-medium">Auto-settles the next pending installment</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-900 hover:text-white text-lg font-black transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Details Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Loan Account:</span>
              <span className="font-mono font-bold text-slate-800">{acctNum}</span>
            </div>
            {customerName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-semibold text-slate-800">{customerName}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Outstanding Principal:</span>
              <span className="font-mono font-bold text-amber-600">
                ₹{remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
              {successMessage}
            </div>
          )}

          {/* Repayment Amount */}
          {!successMessage ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repayment Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-lg font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {successMessage ? "Close" : "Cancel"}
            </button>
            {!successMessage && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition shadow disabled:opacity-50"
              >
                {loading ? "Recording..." : "Collect & Settle Next EMI"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};