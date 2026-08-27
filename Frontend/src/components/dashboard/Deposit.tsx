import React, { useState } from "react";
import { transactionService } from "../../services/transaction.service";

// Define the component props interface
interface DepositProps {
  acctNum: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const Deposit: React.FC<DepositProps> = ({
  acctNum,
  currentBalance,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Local state for user inputs, async loading state, and error messages
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return nothing if the modal is set to closed
  if (!isOpen) return null;

  // Handle deposit form submission and validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents browser page refresh
    setError(null); // Clear any existing error state
    const numAmount = Number(amount); // Parse input string to number

    // Validate that the entered amount is positive
    if (numAmount <= 0) {
      setError("Deposit amount must be greater than zero");
      return;
    }

    setLoading(true); // Trigger loading indicator and disable submit
    try {
      // Call backend API service to execute the deposit
      await transactionService.deposit({
        AcctNum: acctNum,
        Amount: numAmount,
        Remarks: remarks || "Cash Deposit", // Fallback to default remark
      });
      setAmount(""); // Reset amount input field
      setRemarks(""); // Reset remarks input field
      onSuccess(); // Notify parent to refresh dashboard balance/data
      onClose(); // Close the modal dialog
    } catch (err: any) {
      // Catch and display error message from the API or fallback
      setError(typeof err === "string" ? err : "Deposit failed. Please try again.");
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    // Fullscreen backdrop overlay with blur effect
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Modal dialog container card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header: Title and Close button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Deposit Funds</h3>
            <p className="text-xs text-slate-500 font-mono">To: {acctNum}</p>
          </div>
          {/* Top-right close 'X' button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Conditional error banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Deposit submission form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Deposit Amount input field with current balance display */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Balance:{" "}
              <span className="text-emerald-600 font-bold">
                ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder="Enter deposit amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)} // Update amount state
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Optional Remarks input field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Cash Deposit, Salary"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)} // Update remarks state
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Form action buttons: Cancel and Confirm */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {/* Cancel/Dismiss button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            {/* Submit button with disabled loading state */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg disabled:bg-emerald-300 transition"
            >
              {loading ? "Depositing..." : "Confirm Deposit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};