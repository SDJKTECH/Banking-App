import React, { useState } from "react";
import { kycService } from "../../services/kyc.service";
import { KYCRecord } from "../../types/customer.types";

// Component props interface defining modal state, customer info, and callback handlers
interface KYCModalProps {
  custId: string;
  currentKYC?: KYCRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KYCModal: React.FC<KYCModalProps> = ({
  custId,
  currentKYC,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Form input states initialized with existing KYC data if available
  const [docType, setDocType] = useState(currentKYC?.DocumentType || "PASSPORT");
  const [docNumber, setDocNumber] = useState(currentKYC?.DocumentNumber || "");
  const [issueDate, setIssueDate] = useState(
    currentKYC?.IssueDate ? currentKYC.IssueDate.split("T")[0] : ""
  );
  const [expiryDate, setExpiryDate] = useState(
    currentKYC?.ExpiryDate ? currentKYC.ExpiryDate.split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false); // Async request loading indicator state
  const [error, setError] = useState<string | null>(null); // Submission error message state

  // Do not render anything when the modal visibility is false
  if (!isOpen) return null;

  // Handle KYC document form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form reload
    setError(null); // Clear any active error message
    setLoading(true); // Disable buttons and trigger loading state

    try {
      // Send verified payload to the backend KYC API service
      await kycService.submitKYC({
        CustID: custId,
        DocumentType: docType,
        DocumentNumber: docNumber.trim(), // Sanitize whitespace from document number
        IssueDate: issueDate,
        ExpiryDate: expiryDate || undefined, // Send undefined if expiry is blank
      });
      onSuccess(); // Trigger parent refresh to update KYC status in UI
      onClose(); // Close the modal dialog
    } catch (err: any) {
      // Set error message from API response or fallback text
      setError(typeof err === "string" ? err : "Failed to submit KYC verification");
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    // Semi-transparent backdrop overlay with blur
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Modal card container */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal header with title, customer ID, and close button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">KYC Identity Verification</h3>
            <p className="text-xs text-slate-500 font-mono">Customer ID: {custId}</p>
          </div>
          {/* Header dismiss button */}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* Dynamic error alert banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* KYC data collection form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Document type selector dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)} // Update selected document type
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="PASSPORT">Passport</option>
              <option value="DRIVING_LICENSE">Driving License</option>
              <option value="NATIONAL_ID">National ID / Aadhaar</option>
              <option value="PAN_CARD">PAN Card</option>
            </select>
          </div>

          {/* Document identifier input field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. Z1234567"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)} // Update document number state
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Date fields grid (Issue and Expiry dates) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Document issue date picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)} // Update issue date state
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Optional document expiry date picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)} // Update expiry date state
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {/* Modal dismiss/cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            {/* Submit verification button with loading disabled state */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-blue-300 transition"
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};