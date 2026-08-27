import React, { useState } from "react";
import { CustomerProfile, UpdateCustomerPayload } from "../../types/customer.types";
import { customerService } from "../../services/customer.service";

// Define the TypeScript interface for modal component props and action callbacks
interface AdminEditCustomerModalProps {
  customer: CustomerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: CustomerProfile) => void;
}

// Render the admin modal component for editing customer records
export const AdminEditCustomerModal: React.FC<AdminEditCustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Initialize form state prefilled with target customer profile values
  const [formData, setFormData] = useState<UpdateCustomerPayload>({
    FirstName: customer.FirstName,
    LastName: customer.LastName,
    EmailId: customer.EmailId,
    Mobile: customer.Mobile,
    Phone: customer.Phone || "",
    Address1: customer.Address1,
    Address2: customer.Address2 || "",
    City: customer.City || "",
    State: customer.State || "",
    Country: customer.Country || "India",
    ZIPCode: customer.ZIPCode || "",
    MaritalStatus: customer.MaritalStatus || "Single",
  });

  // State to track async API update loading status
  const [loading, setLoading] = useState(false);
  // State to capture and display update error messages
  const [error, setError] = useState<string | null>(null);

  // Return nothing if the modal visibility flag is false
  if (!isOpen) return null;

  // Handle form submission and customer record update workflow
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default browser form submission refresh
    e.preventDefault();
    // Reset prior errors before attempting update
    setError(null);
    // Set loading state to true during API request execution
    setLoading(true);

    try {
      // Send updated customer payload to backend API service
      const res = await customerService.updateCustomer(customer.CustID, formData);
      // Trigger parent callback with updated customer data
      onSuccess(res.data);
      // Close the modal dialog on successful update
      onClose();
    } catch (err: any) {
      // Set error message on failed update attempt
      setError(typeof err === "string" ? err : "Failed to update customer record");
    } finally {
      // Reset loading state after completion
      setLoading(false);
    }
  };

  return (
    // Fixed backdrop overlay with centering layout and blur effect
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Modal card container with responsive width, rounded borders, and vertical constraint */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal header displaying title, target customer ID, and close button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Customer Record</h3>
            <p className="text-xs text-slate-500 font-mono">ID: {customer.CustID}</p>
          </div>
          {/* Dismiss button to close the modal dialog */}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* Conditionally rendered error alert banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Scrollable customer update form container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Responsive two-column grid layout for customer names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Controlled input field for customer first name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                required
                value={formData.FirstName}
                onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Controlled input field for customer last name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                required
                value={formData.LastName}
                onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Responsive two-column grid layout for customer contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Controlled input field for email address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.EmailId}
                onChange={(e) => setFormData({ ...formData, EmailId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Controlled monospace input field for primary mobile number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                required
                value={formData.Mobile}
                onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Controlled input field for primary street address line */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 1 *</label>
            <input
              required
              value={formData.Address1}
              onChange={(e) => setFormData({ ...formData, Address1: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Responsive three-column grid layout for location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Controlled input field for city */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                value={formData.City || ""}
                onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Controlled input field for state */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                value={formData.State || ""}
                onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Controlled input field for ZIP/postal code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP Code</label>
              <input
                value={formData.ZIPCode || ""}
                onChange={(e) => setFormData({ ...formData, ZIPCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Modal action buttons container */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {/* Cancel button to discard modifications and close modal */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            {/* Submit button with dynamic loading text and primary blue styling */}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-blue-300 transition"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};