// src/components/teller/customers/CustomerAccountsDetailView.tsx
import React from "react";
import { CustomerProfile, CustomerAccount } from "../../types/customer.types";
import { CustomerTransactionsSection } from "../teller/CustomerTransactionSection";

interface CustomerAccountsDetailViewProps {
  customer: CustomerProfile;
  onBack: () => void;
  onOpenNewAccount?: (cust: CustomerProfile) => void;
  onViewDetails: (cust: CustomerProfile) => void;
  onEditCustomer: (cust: CustomerProfile) => void;
  onGrantLoan: (custId: string) => void;
  onOpenDeposit: (acctNum: string, balance: number) => void;
  onOpenWithdraw: (acctNum: string, balance: number) => void;
  onOpenTransfer: (acctNum: string, balance: number) => void;
  onCloseAccount: (acctNum: string) => void;
}

export const CustomerAccountsDetailView: React.FC<CustomerAccountsDetailViewProps> = ({
  customer,
  onBack,
  onOpenNewAccount,
  onViewDetails,
  onEditCustomer,
  onGrantLoan,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onCloseAccount,
}) => {
  const accounts = customer.Accounts || [];

  return (
    <div className="space-y-6 transition-all duration-300 ease-in-out pb-12">
      {/* Back Navigation Bar & Customer Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
            title="Back to Customer Directory"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {customer.FirstName} {customer.LastName}
              </h1>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                {customer.CustID}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {customer.EmailId} • {customer.Mobile} • {customer.City || "N/A"}, {customer.State || "N/A"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenNewAccount && (
            <button
              type="button"
              onClick={() => onOpenNewAccount(customer)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow shadow-emerald-600/20"
            >
              + Open New Account
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewDetails(customer)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Full Profile
          </button>
          <button
            type="button"
            onClick={() => onEditCustomer(customer)}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => onGrantLoan(customer.CustID)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow shadow-amber-500/20"
          >
            + Grant Loan
          </button>
        </div>
      </div>

      {/* Linked Accounts Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Linked Accounts ({accounts.length})
          </h2>
          <p className="text-xs text-slate-500">
            Operate cash deposits, withdrawals, and assisted transfers for this customer.
          </p>
        </div>
      </div>

      {/* Linked Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          No bank accounts linked to this customer profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account: CustomerAccount) => {
            const isSaving = account.AccountType.AccountType === "SAVING";
            const balance = Number(
              account.SavingAccount?.Balance || account.LoanAccount?.BalanceAmount || 0
            );

            return (
              <div
                key={account.AcctNum}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isSaving
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {account.AccountType.AccountType} Account
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Branch: {account.SavingAccount?.BranchCode || account.LoanAccount?.BranchCode || "BR001"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-500">Account Number</span>
                    <p className="text-base font-mono font-bold text-slate-800 tracking-wider">
                      {account.AcctNum.replace(/(\d{4})/g, "$1 ").trim()}
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      IFSC: {account.SavingAccount?.IFSCCode || account.LoanAccount?.IFSCCode || "JKBK0000001"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">
                      {isSaving ? "Available Balance" : "Outstanding Principal"}
                    </span>
                    <span
                      className={`text-2xl font-black ${
                        isSaving ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {isSaving && (
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenDeposit(account.AcctNum, balance)}
                        className="py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center transition shadow-sm"
                      >
                        Deposit
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenWithdraw(account.AcctNum, balance)}
                        className="py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-center transition shadow-sm"
                      >
                        Withdraw
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTransfer(account.AcctNum, balance)}
                        className="py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center transition shadow-sm"
                      >
                        Transfer
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onCloseAccount(account.AcctNum)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition text-center font-medium"
                  >
                    Close Account
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction History Section rendered directly below accounts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
        <CustomerTransactionsSection customerAccounts={accounts} />
      </div>
    </div>
  );
};