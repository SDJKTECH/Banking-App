// src/components/dashboard/TransactionHistoryModal.tsx
import React, { useEffect, useState } from "react";
import { transactionService } from "../../services/transaction.service";
import { TransactionRecord } from "../../types/transaction.types";
import { exportToCSV } from "../../utils/exportStatement";

interface HistoryModalProps {
  acctNum: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistoryModal: React.FC<HistoryModalProps> = ({
  acctNum,
  isOpen,
  onClose,
}) => {
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "DEPOSIT" | "WITHDRAW">("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      transactionService
        .getHistory(acctNum, filter)
        .then((res) => setHistory(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, acctNum, filter]);

  // Export to CSV handler
  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ["Transaction ID", "Date", "Description", "Debit (INR)", "Credit (INR)", "Balance (INR)"];
    const rows = history.map((tx) => [
      tx.TxnID,
      new Date(tx.TxnDate).toLocaleString("en-IN"),
      tx.TxnDetail || "Self-Service Transaction",
      Number(tx.WithdrawAmount) > 0 ? Number(tx.WithdrawAmount) : 0,
      Number(tx.DepositAmount) > 0 ? Number(tx.DepositAmount) : 0,
      Number(tx.Balance),
    ]);

    exportToCSV({
      filename: `Statement_${acctNum}_${new Date().toISOString().split("T")[0]}`,
      headers,
      rows,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Account Statement</h3>
            <p className="text-xs text-slate-500 font-mono">Account: {acctNum}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 shrink-0">
          <div className="flex gap-1.5 text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === "ALL" ? "bg-slate-900 text-white" : "bg-white border text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilter("DEPOSIT")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === "DEPOSIT" ? "bg-emerald-600 text-white" : "bg-white border text-slate-600 hover:bg-slate-100"
              }`}
            >
              Credits Only
            </button>
            <button
              onClick={() => setFilter("WITHDRAW")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === "WITHDRAW" ? "bg-rose-600 text-white" : "bg-white border text-slate-600 hover:bg-slate-100"
              }`}
            >
              Debits Only
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={history.length === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-40"
            >
              <span>📥</span> Download CSV
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={history.length === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-40"
            >
              <span>🖨️</span> Print / PDF
            </button>
          </div>
        </div>

        {/* Statement Records Table */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Loading statement records...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No transaction entries found for this period.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Description</th>
                  <th className="pb-2.5 text-right">Debit</th>
                  <th className="pb-2.5 text-right">Credit</th>
                  <th className="pb-2.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {history.map((tx) => (
                  <tr key={tx.TxnID} className="hover:bg-slate-50/80">
                    <td className="py-3 text-slate-600">
                      {new Date(tx.TxnDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 font-sans font-medium text-slate-800">{tx.TxnDetail || "Transfer / Cash"}</td>
                    <td className="py-3 text-right text-rose-600 font-semibold">
                      {Number(tx.WithdrawAmount) > 0 ? `- ₹${Number(tx.WithdrawAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="py-3 text-right text-emerald-600 font-semibold">
                      {Number(tx.DepositAmount) > 0 ? `+ ₹${Number(tx.DepositAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="py-3 text-right text-slate-900 font-bold">
                      ₹{Number(tx.Balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};