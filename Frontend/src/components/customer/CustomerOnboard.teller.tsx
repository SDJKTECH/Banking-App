import React, { useState } from "react";
import { OnboardCustomerPayload } from "../../types/teller.types";

interface CustomerOnboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: OnboardCustomerPayload) => Promise<any>;
}

export const CustomerOnboardTeller: React.FC<CustomerOnboardProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<OnboardCustomerPayload>({
    FirstName: "",
    LastName: "",
    EmailId: "",
    Mobile: "",
    Phone: "",
    DOB: "",
    MaritalStatus: "SINGLE",
    Address1: "",
    Address2: "",
    City: "Bengaluru",
    State: "Karnataka",
    Country: "India",
    ZIPCode: "560001",
    AccountType: "SAVING",
    BranchCode: "BR001",
    IFSCCode: "JKBK0000001",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to onboard customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Onboard New Customer</h3>
            <p className="text-xs text-slate-500">
              Temporary credentials will be auto-generated and emailed directly to the customer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                name="FirstName"
                required
                value={formData.FirstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="LastName"
                required
                value={formData.LastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="EmailId"
                required
                value={formData.EmailId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                name="Mobile"
                required
                value={formData.Mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                name="DOB"
                required
                value={formData.DOB}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
              <select
                name="MaritalStatus"
                value={formData.MaritalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t border-slate-200 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Address Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address 1 *</label>
                <input
                  type="text"
                  name="Address1"
                  required
                  value={formData.Address1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="City"
                    required
                    value={formData.City}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="State"
                    required
                    value={formData.State}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    name="Country"
                    required
                    value={formData.Country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    name="ZIPCode"
                    required
                    value={formData.ZIPCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Configuration */}
          <div className="border-t border-slate-200 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Initial Account Setup</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type</label>
                <select
                  name="AccountType"
                  value={formData.AccountType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="SAVING">Savings Account</option>
                  <option value="LOAN">Loan Account</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
                <input
                  type="text"
                  name="BranchCode"
                  value={formData.BranchCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="IFSCCode"
                  value={formData.IFSCCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg disabled:bg-amber-300 transition"
            >
              {submitting ? "Provisioning..." : "Onboard & Dispatch Credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};