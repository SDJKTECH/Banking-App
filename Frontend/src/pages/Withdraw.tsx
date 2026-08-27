import React, { useState } from "react";
import { transactionService } from "../services/transaction.service";

// Define the TypeScript interface for the withdrawal modal component props
interface WithdrawProps {
  acctNum: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Render the modal component for handling bank account cash withdrawals
export const Withdraw: React.FC<WithdrawProps> = ({
  acctNum,
  currentBalance,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // State to store the withdrawal amount entered by the user
  const [amount, setAmount] = useState<string>("");
  // State to store optional transaction remarks or descriptions
  const [remarks, setRemarks] = useState<string>("");
  // State to track async API submission and loading status
  const [loading, setLoading] = useState(false);
  // State to store and display validation or API error messages
  const [error, setError] = useState<string | null>(null);

  // Return nothing if the modal visibility flag is false
  if (!isOpen) return null;

  // Handle withdrawal validation, submission, and state cleanup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = Number(amount);

    // Validate that the withdrawal amount is strictly positive
    if (numAmount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    // Validate that the withdrawal amount does not exceed the current balance
    if (numAmount > currentBalance) {
      setError("Insufficient funds for this withdrawal");
      return;
    }

    setLoading(true);
    try {
      // Send withdrawal payload to backend transaction service
      await transactionService.withdraw({
        AcctNum: acctNum,
        Amount: numAmount,
        Remarks: remarks || "Cash Withdrawal",
      });
      // Clear input fields after successful transaction
      setAmount("");
      setRemarks("");
      // Trigger parent refresh callback
      onSuccess();
      // Close the modal dialog
      onClose();
    } catch (err: any) {
      // Capture and display error message on API failure
      setError(typeof err === "string" ? err : "Withdrawal failed. Please try again.");
    } finally {
      // Reset loading state after completion
      setLoading(false);
    }
  };

  return (
    // Fixed backdrop overlay with centering layout and blur effect
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Modal card container with border, rounded corners, and shadow */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal header displaying title, target account number, and close button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Withdraw Cash</h3>
            <p className="text-xs text-slate-500 font-mono">From: {acctNum}</p>
          </div>
          {/* Close button to dismiss modal without saving */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Conditionally rendered error message alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Withdrawal form containing balance info, input fields, and action buttons */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Withdrawal amount input group with available balance display */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Balance:{" "}
              <span className="text-emerald-600 font-bold">
                ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </label>
            {/* Number input field for specifying the withdrawal sum */}
            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder="Enter amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Optional transaction remarks input field group */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks (Optional)
            </label>
            {/* Text input for custom transaction notes */}
            <input
              type="text"
              placeholder="e.g. ATM / Cash"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Modal action buttons container */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {/* Cancel button to close the modal */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            {/* Submit button with loading state toggle and danger styling */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:bg-red-300 transition"
            >
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};