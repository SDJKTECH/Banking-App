// src/components/statements/GlobalStatements.teller.tsx
import React, { useState } from "react";
import type { TellerStatementItem, PaginationMeta, TellerStatementFilters } from "../../types/teller.types";
import { exportToCSV } from "../../utils/exportStatement";

interface GlobalStatementsProps {
  statements: TellerStatementItem[] | { statements: TellerStatementItem[]; pagination?: PaginationMeta };
  pagination?: PaginationMeta;
  loading: boolean;
  selectedAcctNum?: string;
  onFetchStatements: (filters?: TellerStatementFilters) => void;
}

export const GlobalStatementsTeller: React.FC<GlobalStatementsProps> = ({
  statements,
  pagination: propPagination,
  loading,
  selectedAcctNum,
  onFetchStatements,
}) => {
  // 🛡️ Safely resolve array whether passed as an array or paginated object
  const statementList: TellerStatementItem[] = Array.isArray(statements)
    ? statements
    : Array.isArray((statements as any)?.statements)
    ? (statements as any).statements
    : [];

  const pagination =
    propPagination ||
    (!Array.isArray(statements) && (statements as any)?.pagination
      ? (statements as any).pagination
      : undefined);

  const [mode, setMode] = useState<"LAST_5" | "CUSTOM_DATE" | "ALL_CUSTOMERS">("LAST_5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalCount = pagination?.totalCount ?? statementList.length;
  const totalPages = pagination?.totalPages ?? (Math.ceil(totalCount / pageSize) || 1);

  const fetchFilteredStatements = (targetPage: number, targetMode: "LAST_5" | "CUSTOM_DATE" | "ALL_CUSTOMERS") => {
    if (targetMode === "LAST_5") {
      onFetchStatements({
        acctNum: selectedAcctNum,
        limit: 5,
        page: 1,
        pageSize: 5,
      });
    } else if (targetMode === "CUSTOM_DATE") {
      onFetchStatements({
        acctNum: selectedAcctNum,
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        page: targetPage,
        pageSize,
      });
    } else if (targetMode === "ALL_CUSTOMERS") {
      onFetchStatements({
        page: targetPage,
        pageSize,
      });
    }
  };

  const handleApplyFilter = () => {
    setDateError(null);

    if (mode === "CUSTOM_DATE") {
      if (!startDate.trim() && !endDate.trim()) {
        setDateError("Please select a date duration to filter transactions.");
        setHasSearched(false);
        return;
      }
    }

    setHasSearched(true);
    setCurrentPage(1);
    fetchFilteredStatements(1, mode);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchFilteredStatements(newPage, mode);
    }
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const handleExportAuditCSV = () => {
    if (statementList.length === 0) return;

    const headers = [
      "Txn ID",
      "Date",
      "Account Number",
      "Customer Name",
      "Customer Mobile",
      "Description",
      "Debit Amount (INR)",
      "Credit Amount (INR)",
      "Closing Balance (INR)",
    ];

    const rows = statementList.map((txn) => {
      const customer = (txn.Account as any)?.Account?.Customer;
      return [
        txn.TxnID,
        new Date(txn.TxnDate).toLocaleString("en-IN"),
        txn.AcctNum,
        customer ? `${customer.FirstName} ${customer.LastName}` : "N/A",
        customer?.Mobile || "N/A",
        txn.TxnDetail || "-",
        Number(txn.WithdrawAmount) > 0 ? Number(txn.WithdrawAmount) : 0,
        Number(txn.DepositAmount) > 0 ? Number(txn.DepositAmount) : 0,
        Number(txn.Balance),
      ];
    });

    exportToCSV({
      filename: `Teller_Audit_Ledger_${new Date().toISOString().split("T")[0]}`,
      headers,
      rows,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900">Statements & Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bank-wide counter transactions, audit trails, and journal logs.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportAuditCSV}
          disabled={!hasSearched || statementList.length === 0}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>📥</span> Export Audit Ledger (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("LAST_5");
              setHasSearched(false);
              setDateError(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "LAST_5" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Recent 5 Txns
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("CUSTOM_DATE");
              setHasSearched(false);
              setDateError(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "CUSTOM_DATE" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Date Filter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("ALL_CUSTOMERS");
              setHasSearched(false);
              setDateError(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "ALL_CUSTOMERS" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Customers Ledger
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mode === "CUSTOM_DATE" && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError(null);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateError(null);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow cursor-pointer"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Date Validation Alert */}
      {dateError && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{dateError}</span>
        </div>
      )}

      {/* Ledger Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">Querying ledger logs...</div>
        ) : !hasSearched ? (
          <div className="p-16 text-center text-slate-400 text-sm space-y-1">
            <span className="text-2xl block mb-1">🔍</span>
            <p className="font-semibold text-slate-600">No transactions displayed</p>
            <p className="text-xs text-slate-400">
              {mode === "CUSTOM_DATE"
                ? "Select a date duration and click Apply Filter to view transactions."
                : "Select a filter mode and click Apply Filter to generate the statement ledger."}
            </p>
          </div>
        ) : statementList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No transaction entries matched the criteria.</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Txn ID / Date</th>
                    <th className="px-4 py-3">Account & Customer</th>
                    <th className="px-4 py-3">Narration</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {statementList.map((txn) => {
                    const customer = (txn.Account as any)?.Account?.Customer;
                    const isDebit = Number(txn.WithdrawAmount) > 0;
                    const isCredit = Number(txn.DepositAmount) > 0;

                    return (
                      <tr key={txn.TxnID} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{txn.TxnID}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(txn.TxnDate).toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{txn.AcctNum}</div>
                          {customer && (
                            <div className="text-xs font-sans text-slate-500">
                              {customer.FirstName} {customer.LastName} ({customer.Mobile})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-sans text-slate-600">{txn.TxnDetail || "-"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-600">
                          {isDebit ? `- ₹${Number(txn.WithdrawAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                          {isCredit ? `+ ₹${Number(txn.DepositAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          ₹{Number(txn.Balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Controls */}
            {mode !== "LAST_5" && totalCount > 0 && (
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
                    <span>Txns</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
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
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
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
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
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
        )}
      </div>
    </div>
  );
};