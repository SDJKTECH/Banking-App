// src/components/teller/TellerKYCQueue.tsx
import React, { useState, useEffect, useCallback } from "react";
import { kycService, UnappliedCustomerItem } from "../../services/kyc.service";
import type { PaginationMeta } from "../../types/teller.types";

export interface KYCQueueItem {
  KYCID: string;
  CustID: string;
  DocumentType: string;
  DocumentNumber: string;
  IssueDate: string;
  ExpiryDate: string;
  VerificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  Customer?: {
    FirstName: string;
    LastName: string;
    EmailId: string;
    Mobile: string;
  };
}

interface TellerKYCQueueProps {
  queue: KYCQueueItem[];
  loading: boolean;
  onApprove: (kycId: string) => Promise<void>;
  onReject: (kycId: string) => Promise<void>;
  onRefresh: () => void;
}

export const TellerKYCQueue: React.FC<TellerKYCQueueProps> = ({
  queue,
  loading,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"PENDING" | "NON_KYC">("PENDING");

  // Server-side pagination and search state for Non-KYC customers
  const [nonKycCustomers, setNonKycCustomers] = useState<UnappliedCustomerItem[]>([]);
  const [nonKycPagination, setNonKycPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [fetchingNonKyc, setFetchingNonKyc] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch page-by-page directly from the backend
  const fetchNonKycPage = useCallback(async (page: number = 1, search: string = "") => {
    setFetchingNonKyc(true);
    try {
      const res = await kycService.getUnappliedCustomers({
        page,
        pageSize: 10,
        search: search.trim() || undefined,
      });
      if (res.data) {
        setNonKycCustomers(res.data.customers || []);
        setNonKycPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch unapplied KYC customers:", err);
    } finally {
      setFetchingNonKyc(false);
    }
  }, []);

  useEffect(() => {
    fetchNonKycPage(1, searchTerm);
  }, [fetchNonKycPage, queue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNonKycPage(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= nonKycPagination.totalPages &&
      newPage !== nonKycPagination.page
    ) {
      fetchNonKycPage(newPage, searchTerm);
    }
  };

  const handleFullRefresh = () => {
    onRefresh();
    fetchNonKycPage(nonKycPagination.page, searchTerm);
  };

  const startRecord =
    nonKycPagination.totalCount === 0
      ? 0
      : (nonKycPagination.page - 1) * nonKycPagination.pageSize + 1;
  const endRecord = Math.min(
    nonKycPagination.page * nonKycPagination.pageSize,
    nonKycPagination.totalCount
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">KYC Compliance Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pending document approvals and track customers requiring verification.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFullRefresh}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          🔄 Refresh Center
        </button>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit select-none">
        <button
          type="button"
          onClick={() => setActiveSubTab("PENDING")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "PENDING"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>⏳ Pending Requests</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/10 font-mono text-[11px]">
            {queue.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("NON_KYC")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "NON_KYC"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>⚠️ Non-KYC / Unapplied Customers</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 font-mono text-[11px]">
            {nonKycPagination.totalCount}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING VERIFICATION REQUESTS */}
      {activeSubTab === "PENDING" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
              Loading pending KYC applications...
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              🎉 All submitted KYC verification requests have been processed!
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.KYCID}
                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {item.Customer
                        ? `${item.Customer.FirstName} ${item.Customer.LastName}`
                        : "Customer Record"}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                      {item.CustID}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                      Pending Approval
                    </span>
                  </div>

                  {item.Customer && (
                    <p className="text-xs text-slate-500">
                      {item.Customer.EmailId} • {item.Customer.Mobile}
                    </p>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 mt-2 space-y-1">
                    <div>
                      <span className="text-slate-400">Document Type:</span>{" "}
                      <strong>{item.DocumentType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Document Number:</span>{" "}
                      <strong className="font-bold">{item.DocumentNumber}</strong>
                    </div>
                    <div className="flex gap-4 text-[11px] text-slate-500">
                      <span>Issued: {new Date(item.IssueDate).toLocaleDateString("en-IN")}</span>
                      {item.ExpiryDate && (
                        <span>Expires: {new Date(item.ExpiryDate).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => onReject(item.KYCID)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
                  >
                    ✕ Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprove(item.KYCID)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    ✓ Verify & Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: NON-KYC / UNAPPLIED CUSTOMERS (SERVER-SIDE PAGINATED) */}
      {activeSubTab === "NON_KYC" && (
        <div className="space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-2"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search unapplied customers by ID, Name, Email, or Mobile..."
              className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  fetchNonKycPage(1, "");
                }}
                className="px-3 py-2 text-slate-500 hover:bg-slate-100 text-xs rounded-xl cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="divide-y divide-slate-100">
              {fetchingNonKyc ? (
                <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
                  Fetching unapplied customer records...
                </div>
              ) : nonKycCustomers.length === 0 ? (
                <div className="p-12 text-center text-emerald-600 text-sm font-semibold">
                  ✨ Excellent! All registered customers have submitted their KYC verification.
                </div>
              ) : (
                nonKycCustomers.map((cust) => (
                  <div
                    key={cust.CustID}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {cust.FirstName} {cust.LastName}
                        </span>
                        <span className="font-mono text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                          {cust.CustID}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 rounded-full">
                          ⚠️ Not Verified Yet / Non-KYC
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {cust.EmailId} • {cust.Mobile} • {cust.City}, {cust.State}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      Awaiting Customer Submission
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {nonKycPagination.totalCount > 0 && (
              <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-500 shadow-2xs">
                    <span>Showing</span>
                    <strong className="font-mono font-bold text-slate-800">
                      {startRecord}–{endRecord}
                    </strong>
                    <span className="text-slate-300">•</span>
                    <span>Total</span>
                    <strong className="font-mono font-bold text-rose-600">
                      {nonKycPagination.totalCount}
                    </strong>
                    <span>Unapplied Customers</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(nonKycPagination.page - 1)}
                    disabled={nonKycPagination.page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: nonKycPagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === nonKycPagination.totalPages ||
                          Math.abs(p - nonKycPagination.page) <= 2
                      )
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
                                nonKycPagination.page === pageNum
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
                    onClick={() => handlePageChange(nonKycPagination.page + 1)}
                    disabled={nonKycPagination.page === nonKycPagination.totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};