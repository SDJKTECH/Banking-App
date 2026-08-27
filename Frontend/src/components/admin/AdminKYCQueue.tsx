import React, { useEffect, useState } from "react";
import { kycService, PendingKYCItem } from "../../services/kyc.service";

// Render the admin KYC verification queue management component
export const AdminKYCQueue: React.FC = () => {
  // State storing the list of pending KYC verification items
  const [queue, setQueue] = useState<PendingKYCItem[]>([]);
  // State tracking initial queue fetch loading status
  const [loading, setLoading] = useState(false);
  // State storing the ID of the KYC item currently being approved or rejected
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // State holding error messages from network or review actions
  const [error, setError] = useState<string | null>(null);
  // State holding action success confirmation feedback messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch pending KYC verification requests from the backend API
  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kycService.getPendingQueue();
      setQueue(res.data || []);
    } catch (err: any) {
      // Set error message if queue retrieval fails
      setError(
        typeof err === "string"
          ? err
          : "Failed to load pending KYC queue"
      );
    } finally {
      // Turn off loading state after fetch completes
      setLoading(false);
    }
  };

  // Fetch the verification queue automatically on initial component mount
  useEffect(() => {
    fetchQueue();
  }, []);

  // Handle administrator review action to verify or reject a customer KYC submission
  const handleReview = async (
    kycId: string,
    custId: string,
    status: "VERIFIED" | "REJECTED"
  ) => {
    setActionLoading(kycId);
    setError(null);
    setSuccessMsg(null);

    try {
      // Submit updated verification status to the backend service
      await kycService.verifyKYC(kycId, status);
      // Display success feedback message with targeted customer ID
      setSuccessMsg(`KYC for Customer ${custId} marked as ${status}`);
      // Remove processed KYC submission from current list state
      setQueue((prev) => prev.filter((item) => item.KYCID !== kycId));
    } catch (err: any) {
      // Set error message if status update fails
      setError(
        typeof err === "string"
          ? err
          : `Failed to update KYC status to ${status}`
      );
    } finally {
      // Clear action loading state
      setActionLoading(null);
    }
  };

  return (
    // Outer card container with borders, rounded corners, and shadow
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header row displaying queue title, subtitle, and manual refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Pending KYC Verification Queue
          </h3>
          <p className="text-xs text-slate-500">
            Review submitted identity verification documents and approve or reject applications.
          </p>
        </div>
        {/* Manual refresh button triggering queue refetch */}
        <button
          type="button"
          onClick={fetchQueue}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition disabled:bg-slate-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh List"}
        </button>
      </div>

      {/* Conditionally rendered error alert notification */}
      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {error}
        </div>
      )}
      {/* Conditionally rendered success alert notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Conditionally render loader, empty queue state, or the verification table */}
      {loading ? (
        // Loading state with animated spinner
        <div className="text-center py-12 text-slate-400 text-sm">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading submissions...
        </div>
      ) : queue.length === 0 ? (
        // Empty state message when no verifications are pending
        <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100">
          🎉 No pending KYC verifications in the queue.
        </div>
      ) : (
        // Scrollable data table listing pending KYC submissions
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {/* Table headers defining submission columns */}
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Doc Type</th>
                <th className="px-4 py-3">Doc Number</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-right">Verification Action</th>
              </tr>
            </thead>
            {/* Table body mapping pending verification records */}
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {queue.map((item) => (
                <tr key={item.KYCID} className="hover:bg-slate-50/60 transition">
                  {/* Customer full name and ID cell */}
                  <td className="px-4 py-3.5 font-sans">
                    <div className="font-semibold text-slate-900">
                      {item.Customer?.FirstName} {item.Customer?.LastName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {item.CustID}
                    </div>
                  </td>
                  {/* Document type badge indicator cell */}
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.DocumentType}
                    </span>
                  </td>
                  {/* Identity document registration number cell */}
                  <td className="px-4 py-3.5 font-bold text-slate-800 tracking-wider">
                    {item.DocumentNumber}
                  </td>
                  {/* Formatted document issue date cell */}
                  <td className="px-4 py-3.5 text-slate-600 font-sans">
                    {item.IssueDate
                      ? new Date(item.IssueDate).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  {/* Formatted document expiration date cell */}
                  <td className="px-4 py-3.5 text-slate-600 font-sans">
                    {item.ExpiryDate
                      ? new Date(item.ExpiryDate).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>
                  {/* Action buttons cell for approving or rejecting verification */}
                  <td className="px-4 py-3.5 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      {/* Approve button to mark KYC record as VERIFIED */}
                      <button
                        type="button"
                        disabled={actionLoading === item.KYCID}
                        onClick={() =>
                          handleReview(item.KYCID, item.CustID, "VERIFIED")
                        }
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:bg-emerald-300 shadow-sm"
                      >
                        {actionLoading === item.KYCID ? "..." : "✓ Approve"}
                      </button>
                      {/* Reject button to mark KYC record as REJECTED */}
                      <button
                        type="button"
                        disabled={actionLoading === item.KYCID}
                        onClick={() =>
                          handleReview(item.KYCID, item.CustID, "REJECTED")
                        }
                        className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition disabled:bg-slate-100"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};