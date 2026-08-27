// src/components/teller/CustomerTransactionSection.tsx
import { useState, useEffect } from "react";
import { transactionService } from "../../services/transaction.service";
import type { CustomerAccount } from "../../types/customer.types";
import type { TransactionRecord } from "../../types/transaction.types";

interface CustomerTransactionsSectionProps {
  customerAccounts: CustomerAccount[];
}

export const CustomerTransactionsSection = ({
  customerAccounts,
}: CustomerTransactionsSectionProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>(
    customerAccounts?.[0]?.AcctNum || ""
  );
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // Accordion dropdown toggle state (starts collapsed by default)
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

  useEffect(() => {
    if (!selectedAccount) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await transactionService.getHistory(selectedAccount);
        const txData = Array.isArray(res) ? res : (res as any)?.data || [];
        setTransactions(txData);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedAccount]);

  if (!customerAccounts || customerAccounts.length === 0) {
    return null;
  }

  // Format continuous 16-digit account numbers with clean 4-digit spacing
  const formatDetails = (detail: string | null) => {
    if (!detail) return "Standard Transaction";
    return detail.replace(/\b(\d{4})(\d{4})(\d{4})(\d{4})\b/g, "$1 $2 $3 $4");
  };

  return (
    <div className="space-y-4">
      {/* ── ACCORDION HEADER BAR ── */}
      <div 
        onClick={() => setIsTransactionsOpen((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer select-none py-1 hover:opacity-80 transition"
      >
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>📊</span> Transaction History
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Click to {isTransactionsOpen ? "collapse" : "expand"} account ledger records
          </p>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isTransactionsOpen ? "rotate-180" : "rotate-0"}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── COLLAPSIBLE CONTENT (Account Picker + Ledger Table) ── */}
      {isTransactionsOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          {/* Account Selector inside dropdown view */}
          <div className="flex justify-end items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Selected Account:</span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm"
            >
              {customerAccounts.map((acc: CustomerAccount) => (
                <option key={acc.AcctNum} value={acc.AcctNum}>
                  {acc.AcctNum.replace(/(\d{4})/g, "$1 ").trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Ledger Table */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading account ledger...
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[360px] border border-slate-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 bg-slate-50">Date</th>
                    <th className="px-4 py-3 bg-slate-50">Details</th>
                    <th className="px-4 py-3 bg-slate-50">Type</th>
                    <th className="px-4 py-3 bg-slate-50">Amount</th>
                    <th className="px-4 py-3 bg-slate-50">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map((tx: TransactionRecord) => {
                    const isDeposit = Number(tx.DepositAmount) > 0;
                    const narration = tx.TxnDetail || "";
                    const isTransfer = narration.toLowerCase().includes("transfer");
                    const amount = isDeposit ? tx.DepositAmount : tx.WithdrawAmount;

                    let badgeLabel = isDeposit ? "DEPOSIT" : "WITHDRAWAL";
                    let badgeStyle = isDeposit
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200";

                    if (isTransfer) {
                      badgeLabel = isDeposit ? "TRANSFER IN" : "TRANSFER OUT";
                      badgeStyle = isDeposit
                        ? "bg-teal-50 text-teal-700 border-teal-200"
                        : "bg-blue-50 text-blue-700 border-blue-200";
                    }

                    return (
                      <tr key={tx.TxnID} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {tx.TxnDate ? new Date(tx.TxnDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {formatDetails(narration)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badgeStyle}`}
                          >
                            {badgeLabel}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 font-bold ${
                            isDeposit ? "text-emerald-600" : "text-slate-800"
                          }`}
                        >
                          {isDeposit ? "+" : "-"}₹
                          {Number(amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 font-semibold">
                          ₹
                          {Number(tx.Balance).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center border border-slate-200 border-dashed rounded-2xl bg-slate-50">
              <p className="text-xs text-slate-400">No transactions recorded yet for this account.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};