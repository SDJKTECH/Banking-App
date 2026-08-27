// src/components/teller/CustomersTab.tsx
import React, { useState } from "react";
import type { CustomerProfile, CustomerAccount } from "../../types/customer.types";
import type { PaginationMeta } from "../../types/teller.types";
import { CustomerTransactionsSection } from "./CustomerTransactionSection";

interface CustomersTabProps {
  customers: CustomerProfile[];
  pagination: PaginationMeta;
  selectedCustomer: CustomerProfile | null;
  onSelectCustomer: (cust: CustomerProfile | null) => void;
  onSearch: (filters?: any) => void;
  onViewDetails: (cust: CustomerProfile) => void;
  onEditCustomer: (cust: CustomerProfile) => void;
  onDeleteCustomer: (custId: string) => void;
  onGrantLoan: (custId: string, acctNum?: string) => void;
  onPayEMI: (
    acctNum: string,
    balance: number,
    customerName: string,
    rateOfInterest?: number,
    loanDuration?: number
  ) => void;
  onOpenNewAccount: (cust: CustomerProfile) => void;
  onOpenDeposit: (acctNum: string, balance: number) => void;
  onOpenWithdraw: (acctNum: string, balance: number) => void;
  onOpenTransfer: (acctNum: string, balance: number) => void;
  onCloseAccount: (acctNum: string) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  pagination,
  selectedCustomer,
  onSelectCustomer,
  onSearch,
  onViewDetails,
  onEditCustomer,
  onDeleteCustomer,
  onGrantLoan,
  onPayEMI,
  onOpenNewAccount,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onCloseAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAccountsOpen, setIsAccountsOpen] = useState(true);

  const { page: currentPage, pageSize, totalCount, totalPages } = pagination;

  const buildFilterPayload = (term: string, targetPage: number) => {
    const payload: any = { page: targetPage, pageSize };
    if (!term) return payload;

    if (term.startsWith("CUST-") || term.startsWith("cust-")) {
      payload.custId = term;
    } else if (term.includes("@")) {
      payload.email = term;
    } else if (/^\d+$/.test(term)) {
      payload.mobile = term;
    } else {
      const parts = term.split(/\s+/);
      if (parts.length > 1) {
        payload.firstName = parts[0];
        payload.lastName = parts.slice(1).join(" ");
      } else {
        payload.name = term;
      }
    }
    return payload;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(buildFilterPayload(searchTerm.trim(), 1));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onSearch(buildFilterPayload(searchTerm.trim(), newPage));
    }
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // =========================================================================
  // 1. CUSTOMER DRILL-DOWN VIEW (ACCOUNTS & TRANSACTIONS)
  // =========================================================================
  if (selectedCustomer) {
    const customerName = `${selectedCustomer.FirstName} ${selectedCustomer.LastName}`;
    const accounts: CustomerAccount[] = selectedCustomer.Accounts || [];

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Customer Header Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onSelectCustomer(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 mb-1 flex items-center gap-1.5 transition cursor-pointer"
            >
              ← Back to Directory
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{customerName}</h1>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/80">
                {selectedCustomer.CustID}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
              <span>📧 {selectedCustomer.EmailId}</span>
              <span>📱 {selectedCustomer.Mobile}</span>
              <span>📍 {selectedCustomer.City}, {selectedCustomer.State}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenNewAccount(selectedCustomer)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>✙</span> Open Account
            </button>
            <button
              type="button"
              onClick={() => onGrantLoan(selectedCustomer.CustID)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>📑</span> Disburse Loan
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(selectedCustomer)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>👤</span> Profile
            </button>
          </div>
        </div>

        {/* Collapsible Linked Accounts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div
            onClick={() => setIsAccountsOpen((prev) => !prev)}
            className="flex justify-between items-center cursor-pointer select-none py-1 hover:opacity-80 transition"
          >
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Linked Accounts ({accounts.length})
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Click to {isAccountsOpen ? "collapse" : "expand"} accounts and action controls
              </p>
            </div>

            <button
              type="button"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isAccountsOpen ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {isAccountsOpen && (
            <div className="pt-2">
              {accounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-sm">
                  No active bank accounts found for this customer.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
                  {accounts.map((acct: CustomerAccount) => {
                    const accountTypeStr =
                      typeof acct.AccountType === "string"
                        ? acct.AccountType
                        : acct.AccountType?.AccountType;

                    const isSaving = accountTypeStr === "SAVING";
                    const isClosed = (acct as any).Status === "CLOSED";
                    const balance = Number(
                      acct.SavingAccount?.Balance || acct.LoanAccount?.BalanceAmount || 0
                    );
                    const formattedAcct = acct.AcctNum.replace(/(\d{4})/g, "$1 ").trim();

                    const handleClose = () => {
                      if (balance > 0) {
                        alert(
                          isSaving
                            ? `Cannot close: Account has active balance of ₹${balance.toLocaleString("en-IN")}. Withdraw funds first.`
                            : `Cannot close: Loan has outstanding balance of ₹${balance.toLocaleString("en-IN")}. Settle dues first.`
                        );
                        return;
                      }
                      if (window.confirm(`Permanently close account ${acct.AcctNum}?`)) {
                        onCloseAccount(acct.AcctNum);
                      }
                    };

                    return (
                      <div
                        key={acct.AcctNum}
                        className={`rounded-2xl p-5 border transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
                          isClosed
                            ? "bg-slate-100/70 border-slate-200 opacity-60"
                            : "bg-slate-50/50 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-[280px]">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 font-bold ${
                              isClosed
                                ? "bg-slate-200 text-slate-500"
                                : isSaving
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {isSaving ? "💳" : "📑"}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isClosed
                                    ? "bg-slate-200 text-slate-600"
                                    : isSaving
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {accountTypeStr}
                              </span>
                              {isClosed && (
                                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                                  CLOSED
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono">
                                {acct.SavingAccount?.BranchCode || acct.LoanAccount?.BranchCode || "BR001"}
                              </span>
                            </div>
                            <p className="font-mono font-bold text-slate-900 text-sm tracking-wider mt-1">
                              {formattedAcct}
                            </p>
                          </div>
                        </div>

                        <div className="lg:text-right px-2">
                          <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                            {isSaving ? "Available Balance" : "Outstanding Principal"}
                          </span>
                          <span
                            className={`text-xl font-black font-mono tracking-tight ${
                              isClosed
                                ? "text-slate-400"
                                : isSaving
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {isClosed ? (
                            <span className="text-xs text-slate-400 font-semibold px-3 py-1.5 bg-slate-100 rounded-xl">
                              Terminated
                            </span>
                          ) : (
                            <>
                              {isSaving ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onOpenDeposit(acct.AcctNum, balance)}
                                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition cursor-pointer"
                                  >
                                    💵 Deposit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onOpenWithdraw(acct.AcctNum, balance)}
                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
                                  >
                                    🏧 Withdraw
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onOpenTransfer(acct.AcctNum, balance)}
                                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
                                  >
                                    🔁 Transfer
                                  </button>
                                </>
                              ) : (
                                <>
                                  {balance > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onPayEMI(
                                          acct.AcctNum,
                                          balance,
                                          customerName,
                                          acct.LoanAccount?.RateOfInterest || 8.5,
                                          acct.LoanAccount?.LoanDuration || 60
                                        )
                                      }
                                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition shadow-sm cursor-pointer"
                                    >
                                      💳 Collect EMI
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onGrantLoan(selectedCustomer.CustID, acct.AcctNum)}
                                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                                    >
                                      📑 Disburse Loan
                                    </button>
                                  )}
                                </>
                              )}

                              <button
                                type="button"
                                onClick={handleClose}
                                title="Close Account"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <CustomerTransactionsSection customerAccounts={accounts} />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SERVER-SIDE PAGINATED CUSTOMER DIRECTORY LIST VIEW
  // =========================================================================
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900">Customer Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search or select a customer to view accounts, execute counter transactions, and service loans.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Customer ID, Name, Email, or Mobile..."
          className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow cursor-pointer"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              onSearch({ page: 1, pageSize });
            }}
            className="px-3 py-2 text-slate-500 hover:bg-slate-100 text-xs rounded-xl cursor-pointer"
          >
            Clear
          </button>
        )}
      </form>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="divide-y divide-slate-100">
          {customers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No customer records found.
            </div>
          ) : (
            customers.map((cust: CustomerProfile) => (
              <div
                key={cust.CustID}
                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition"
              >
                <div className="space-y-0.5 flex-1 select-text">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {cust.FirstName} {cust.LastName}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {cust.CustID}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {cust.EmailId} • {cust.Mobile} • {cust.City}, {cust.State}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(cust)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                  >
                    Manage Accounts ({cust.Accounts?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditCustomer(cust)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomer(cust.CustID)}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Pagination Controls */}
        {totalCount > 0 && (
          <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-500 shadow-2xs">
                <span>Showing</span>
                <strong className="font-mono font-bold text-slate-800">
                  {startRecord}–{endRecord}
                </strong>
                <span className="text-slate-300">•</span>
                <span>Total</span>
                <strong className="font-mono font-bold text-blue-600">
                  {totalCount}
                </strong>
                <span>Customers</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((pageNum) => pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 2)
                  .map((pageNum, index, visiblePages) => {
                    const prevPage = visiblePages[index - 1];
                    const hasGap = prevPage && pageNum - prevPage > 1;

                    return (
                      <React.Fragment key={pageNum}>
                        {hasGap && <span className="px-1 text-slate-400 text-xs">...</span>}
                        <button
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[30px] h-7 px-2 text-xs font-bold font-mono rounded-lg transition cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};