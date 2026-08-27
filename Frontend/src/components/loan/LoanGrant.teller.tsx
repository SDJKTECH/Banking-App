// src/components/loan/LoanGrant.teller.tsx
import React, { useState, useEffect } from "react";
import { GrantLoanPayload } from "../../types/teller.types";

interface LoanGrantTellerProps {
  isOpen: boolean;
  custId?: string;
  preselectedAcctNum?: string;
  onClose: () => void;
  onGrantLoan: (payload: GrantLoanPayload) => Promise<any>;
}

export const LoanGrantTeller: React.FC<LoanGrantTellerProps> = ({
  isOpen,
  custId = "",
  preselectedAcctNum = "",
  onClose,
  onGrantLoan,
}) => {
  const [selectedCustId, setSelectedCustId] = useState<string>(custId);
  const [targetAcctNum, setTargetAcctNum] = useState<string>(preselectedAcctNum);
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [durationMonths, setDurationMonths] = useState<string>("60");
  const [branchCode] = useState<string>("BR001");
  const [ifscCode] = useState<string>("JKBK0000001");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCustId(custId || "");
      setTargetAcctNum(preselectedAcctNum || "");
      setInterestRate("8.5");
      setDurationMonths("60");
      setLoanAmount("");
      setError(null);
    }
  }, [isOpen, custId, preselectedAcctNum]);

  if (!isOpen) return null;

  // Real-time monthly installment preview calculation
  const principal = Number(loanAmount) || 0;
  const numRate = Number(interestRate) || 0;
  const numDuration = Number(durationMonths) || 0;
  const monthlyRate = numRate / 12 / 100;

  const emi =
    principal > 0 && numDuration > 0
      ? monthlyRate === 0
        ? principal / numDuration
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, numDuration)) /
          (Math.pow(1 + monthlyRate, numDuration) - 1)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCustId = selectedCustId.trim();
    const cleanAcctNum = targetAcctNum.trim();

    if (!cleanCustId) {
      setError("Customer ID is required");
      return;
    }

    if (!cleanAcctNum || cleanAcctNum.length !== 16) {
      setError("Please enter a valid 16-digit Loan Account Number");
      return;
    }

    if (principal <= 0) {
      setError("Loan amount must be greater than zero");
      return;
    }

    if (numDuration <= 0) {
      setError("Loan duration must be at least 1 month");
      return;
    }

    setLoading(true);
    try {
      await onGrantLoan({
        CustID: cleanCustId,
        AcctNum: cleanAcctNum,
        TotalLoanAmount: principal,
        RateOfInterest: numRate,
        LoanDurationMonths: numDuration,
        BranchCode: branchCode.trim() || "BR001",
        IFSCCode: ifscCode.trim() || "JKBK0000001",
      });
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to disburse loan. Verify account details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500 text-slate-950 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">Grant / Disburse Loan</h3>
            <p className="text-xs text-slate-900 font-medium">
              Manual Account Number Input
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-900 hover:text-white text-lg font-black transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Customer ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer ID *
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value.toUpperCase())}
              placeholder="e.g. CUST-XXXXXXXX"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Mandatory 16-Digit Loan Account Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Loan Account Number (16 Digits) *
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={targetAcctNum}
              onChange={(e) => setTargetAcctNum(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 1234567890123456"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loan Principal Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="1000"
              step="500"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="50000"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-lg font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Rate & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                placeholder="e.g. 8.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="360"
                placeholder="e.g. 60"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Monthly EMI Preview Card */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-amber-900 block">
                Estimated Monthly Installment (EMI)
              </span>
              <span className="text-xl font-bold text-amber-600">
                ₹{emi.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo
              </span>
            </div>
            <span className="text-[11px] font-mono bg-amber-200/70 text-amber-900 font-bold px-2.5 py-1 rounded-lg">
              {numDuration} Months
            </span>
          </div>

          {/* Branch & IFSC */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs font-mono text-slate-500">
            <span>Branch: <strong>{branchCode}</strong></span>
            <span>IFSC: <strong>{ifscCode}</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || targetAcctNum.length !== 16}
              className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow disabled:opacity-50"
            >
              {loading ? "Disbursing..." : "Disburse Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};