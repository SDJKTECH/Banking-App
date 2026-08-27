import React from "react";
import { CustomerProfile } from "../../types/customer.types";

interface CustomerDetailsModalProps {
  profile: CustomerProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Profile Details</h3>
            <p className="text-xs text-slate-500 font-mono">ID: {profile.CustID}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Personal Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-1">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Full Name</span>
                <span className="font-semibold text-slate-800">
                  {profile.FirstName} {profile.LastName}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Date of Birth</span>
                <span className="font-medium text-slate-800 font-mono">
                  {profile.DOB ? new Date(profile.DOB).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Marital Status</span>
                <span className="font-medium text-slate-800">
                  {profile.MaritalStatus || "Not Specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-1">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Email Address</span>
                <span className="font-semibold text-slate-800">{profile.EmailId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Mobile Number</span>
                <span className="font-semibold text-slate-800 font-mono">{profile.Mobile}</span>
              </div>
              {profile.Phone && (
                <div>
                  <span className="text-xs text-slate-500 block">Alternate Phone</span>
                  <span className="font-medium text-slate-800 font-mono">{profile.Phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Residential Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-1">
              Residential Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Street Address</span>
                <span className="font-medium text-slate-800">
                  {profile.Address1} {profile.Address2 ? `, ${profile.Address2}` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">City & State</span>
                <span className="font-medium text-slate-800">
                  {profile.City || "N/A"}, {profile.State || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Postal / ZIP Code</span>
                <span className="font-medium text-slate-800 font-mono">{profile.ZIPCode || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Country</span>
                <span className="font-medium text-slate-800">{profile.Country || "India"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};