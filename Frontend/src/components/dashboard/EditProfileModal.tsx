import React, { useState } from "react";
import { CustomerProfile, UpdateCustomerPayload } from "../../types/customer.types";

// Define the TypeScript interface for modal component props
interface EditProfileModalProps {
  profile: CustomerProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (payload: UpdateCustomerPayload) => Promise<any>;
}

// Render the edit profile modal component
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdate,
}) => {
  // Initialize form state prefilled with existing customer profile values
  const [formData, setFormData] = useState<UpdateCustomerPayload>({
    FirstName: profile.FirstName,
    LastName: profile.LastName,
    EmailId: profile.EmailId,
    Mobile: profile.Mobile,
    Address1: profile.Address1,
    Address2: profile.Address2 || "",
    City: profile.City || "",
    State: profile.State || "",
    Country: profile.Country || "India",
    ZIPCode: profile.ZIPCode || "",
  });
  // State to track async profile update loading status
  const [loading, setLoading] = useState(false);
  // State to hold and display update error messages
  const [error, setError] = useState<string | null>(null);

  // Return nothing if modal visibility flag is false
  if (!isOpen) return null;

  // Handle form submission and trigger profile update callback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Execute update callback with payload and close modal upon success
      await onUpdate(formData);
      onClose();
    } catch (err: any) {
      // Capture and display error message on update failure
      setError(typeof err === "string" ? err : "Failed to update profile");
    } finally {
      // Reset loading state after completion
      setLoading(false);
    }
  };

  return (
    // Fixed modal overlay backdrop with blur and centering layout
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Modal content dialog card container */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal header with title and dismiss button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Update Profile</h3>
          {/* Close button to dismiss modal */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Conditionally rendered error message banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Scrollable profile update form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Two-column grid layout for first and last names */}
          <div className="grid grid-cols-2 gap-4">
            {/* Input field for first name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                value={formData.FirstName}
                onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Input field for last name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                value={formData.LastName}
                onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Input field for primary mobile number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
            <input
              value={formData.Mobile}
              onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Input field for primary street address line */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address 1</label>
            <input
              value={formData.Address1}
              onChange={(e) => setFormData({ ...formData, Address1: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Input field for secondary optional street address line */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address 2 (Optional)</label>
            <input
              value={formData.Address2 || ""}
              onChange={(e) => setFormData({ ...formData, Address2: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Two-column grid layout for city and state */}
          <div className="grid grid-cols-2 gap-4">
            {/* Input field for city */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                value={formData.City || ""}
                onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Input field for state */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                value={formData.State || ""}
                onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Two-column grid layout for country and postal code */}
          <div className="grid grid-cols-2 gap-4">
            {/* Input field for country */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
              <input
                value={formData.Country || ""}
                onChange={(e) => setFormData({ ...formData, Country: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Input field for ZIP/postal code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP Code</label>
              <input
                value={formData.ZIPCode || ""}
                onChange={(e) => setFormData({ ...formData, ZIPCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal action buttons container */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {/* Cancel button to discard edits and close modal */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            {/* Form submit button with loading text toggle */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-blue-400"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};