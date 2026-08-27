import React, { useState } from "react";
import { transactionService } from "../../services/transaction.service";

// Props interface for transfer parameters, modal visibility, and completion callbacks
interface TransferProps {
  sourceAcctNum: string;
  currentBalance: number;
  transferLimit: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const Transfer: React.FC<TransferProps> = ({
  sourceAcctNum,
  currentBalance,
  transferLimit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Local state for recipient account, amount input, user notes, loading status, and errors
  const [destAcctNum, setDestAcctNum] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return nothing if the modal dialog is not open
  if (!isOpen) return null;

  // Handle transfer validation, submission, and state reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default page refresh on form submission
    setError(null); // Clear any previous error messages
    const numAmount = Number(amount); // Parse amount input to a numeric value

    // Validate that the target account differs from the source account
    if (destAcctNum.trim() === sourceAcctNum) {
      setError("Source and destination accounts cannot be identical");
      return;
    }
    // Validate that the transfer amount is greater than zero
    if (numAmount <= 0) {
      setError("Transfer amount must be greater than zero");
      return;
    }
    // Validate that the balance is sufficient for the transfer
    if (numAmount > currentBalance) {
      setError("Insufficient balance to execute transfer");
      return;
    }
    // Validate that the amount does not exceed daily transfer limit
    if (transferLimit && numAmount > transferLimit) {
      setError(`Amount exceeds daily limit of ₹${transferLimit.toLocaleString("en-IN")}`);
      return;
    }

    setLoading(true); // Set loading state to true during API call
    try {
      // Execute the transfer request via transaction service
      await transactionService.transfer({
        SourceAcctNum: sourceAcctNum,
        DestinationAcctNum: destAcctNum.trim(),
        Amount: numAmount,
        Remarks: remarks || `Transfer to ${destAcctNum.trim()}`, // Default remark if left blank
      });
      setDestAcctNum(""); // Reset destination account input
      setAmount(""); // Reset amount input
      setRemarks(""); // Reset remarks input
      onSuccess(); // Trigger parent refresh to fetch updated balance
      onClose(); // Close the modal dialog
    } catch (err: any) {
      // Set error message from API response or fallback string
      setError(typeof err === "string" ? err : "Transfer failed. Please check details.");
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    // Fixed backdrop overlay with blur effect covering the entire viewport
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Modal card container with rounded borders and shadow */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal header displaying title, source account number, and close button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transfer Funds</h3>
            <p className="text-xs text-slate-500 font-mono">From: {sourceAcctNum}</p>
          </div>
          {/* Close modal action button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Conditional error message display box */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Transfer input form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Beneficiary/Destination account number input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Beneficiary Account Number *
            </label>
            <input
              type="text"
              required
              placeholder="Enter recipient's account number"
              value={destAcctNum}
              onChange={(e) => setDestAcctNum(e.target.value)} // Update destination account state
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Transfer amount input field with maximum balance hint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Amount (₹) *{" "}
              <span className="text-slate-400 font-normal">
                (Max: ₹{currentBalance.toLocaleString("en-IN")})
              </span>
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)} // Update transfer amount state
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Optional transaction remarks input field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Rent, Groceries"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)} // Update remarks state
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer actions: Cancel and Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {/* Modal dismiss/cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            {/* Confirm transfer submit button with dynamic loading label */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-blue-300 transition"
            >
              {loading ? "Sending..." : "Send Money"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};