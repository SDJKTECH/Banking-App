import React, { useState } from "react";
import { CustomerAccount } from "../../types/customer.types";

// Interface for component props including account data and action trigger callback
interface AccountCardProps {
  account: CustomerAccount;
  onOpenAction: (
    action: "DEPOSIT" | "TRANSFER" | "HISTORY",
    data: { acctNum: string; balance: number; limit: number }
  ) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onOpenAction }) => {
  // Local boolean state for toggling account number visibility
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  // Local boolean state for toggling balance amount visibility
  const [showBalance, setShowBalance] = useState(false);

  // Determine whether the current account is a savings account
  const isSaving = account.AccountType.AccountType === "SAVING";
  // Safely extract and parse numerical balance from either Savings or Loan account
  const balance = Number(
    account.SavingAccount?.Balance || account.LoanAccount?.BalanceAmount || 0
  );
  // Extract and parse daily transfer limit for savings accounts
  const limit = Number(account.SavingAccount?.TransferLimit || 0);

  // Format account number into 4-digit groups if visible, otherwise mask leading digits
  const formattedAccountNumber = showAccountNumber
    ? account.AcctNum.replace(/(\d{4})/g, "$1 ").trim()
    : `•••• •••• •••• ${account.AcctNum.slice(-4)}`;

  // Format numerical balance using the Indian numbering system with two decimal places
  const rawBalance = balance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  });

  return (
    // Main card container styled with Tailwind CSS for layout, border, and hover elevation
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Card Header displaying account type badge and branch identifier */}
        <div className="flex justify-between items-center">
          {/* Account type badge styled conditionally based on account category */}
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isSaving
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {account.AccountType.AccountType} Account
          </span>
          {/* Branch code display with BR001 fallback */}
          <span className="text-xs text-slate-400 font-mono">
            Branch: {account.SavingAccount?.BranchCode || account.LoanAccount?.BranchCode || "BR001"}
          </span>
        </div>

        {/* Account Number display block with toggle button */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Account Number</span>
            {/* Toggle button to show or hide the full account number */}
            <button
              type="button"
              onClick={() => setShowAccountNumber((prev) => !prev)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
            >
              {showAccountNumber ? (
                <>
                  <EyeSlashIcon />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <EyeIcon />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
          {/* Render formatted or masked account number */}
          <p className="text-base font-mono font-semibold text-slate-800 tracking-wider">
            {formattedAccountNumber}
          </p>
        </div>

        {/* Balance display section with toggle button */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center mb-1">
            {/* Contextual label for available vs outstanding balance */}
            <span className="text-xs font-medium text-slate-500">
              {isSaving ? "Available Balance" : "Outstanding Balance"}
            </span>
            {/* Toggle button to show or hide the balance amount */}
            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
            >
              {showBalance ? (
                <>
                  <EyeSlashIcon />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <EyeIcon />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>

          {/* Render masked placeholder or formatted currency balance */}
          <p
            className={`text-2xl font-black tracking-tight ${
              isSaving ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {showBalance ? `₹${rawBalance}` : "₹ ••••••"}
          </p>
        </div>
      </div>

      {/* Account Actions and loan metadata section */}
      <div className="space-y-3">
        {/* Render interactive actions and daily limit for savings accounts */}
        {isSaving && (
          <>
            {/* Daily transfer limit badge */}
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Transfer Limit: ₹{limit.toLocaleString("en-IN")}/day
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                {/* Trigger deposit modal action */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenAction("DEPOSIT", {
                      acctNum: account.AcctNum,
                      balance,
                      limit,
                    })
                  }
                  className="py-1.5 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg border border-emerald-200 transition text-center"
                >
                  Deposit
                </button>
                {/* Trigger transfer modal action */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenAction("TRANSFER", {
                      acctNum: account.AcctNum,
                      balance,
                      limit,
                    })
                  }
                  className="py-1.5 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg border border-blue-200 transition text-center"
                >
                  Transfer
                </button>
              </div>
              {/* Trigger transaction history modal action */}
              <button
                type="button"
                onClick={() =>
                  onOpenAction("HISTORY", {
                    acctNum: account.AcctNum,
                    balance,
                    limit,
                  })
                }
                className="w-full py-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 text-xs font-semibold rounded-lg border border-slate-200 transition text-center"
              >
                View Statements
              </button>
            </div>
          </>
        )}

        {/* Render interest rate and duration metadata for loan accounts */}
        {!isSaving && account.LoanAccount && (
          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between">
            <span>Interest: {account.LoanAccount.RateOfInterest}%</span>
            <span>Duration: {account.LoanAccount.LoanDuration} mos</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline SVG icon component representing visible state
const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Inline SVG icon component representing hidden/masked state
const EyeSlashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
);