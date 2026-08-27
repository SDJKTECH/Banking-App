import React from "react";
import { CustomerProfile, KYCRecord } from "../../types/customer.types";
import { useAuth } from "../../hooks/useAuth";

interface DashboardHeaderProps {
  profile: CustomerProfile;
  kycData: KYCRecord | null;
  onOpenKYC: () => void;
  onOpenDetails: () => void;
  onOpenEdit: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  profile,
  kycData,
  onOpenKYC,
  onOpenDetails,
  onOpenEdit,
}) => {
  const { user } = useAuth();
  const isCustomer = user?.role === "CUSTOMER";
  const kycStatus = kycData?.VerificationStatus || "NOT_SUBMITTED";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hello, {profile.FirstName} {profile.LastName} 👋
          </h1>

          {/* KYC Status Badges (Visible ONLY to Customers) */}
          {isCustomer && (
            <>
              {kycStatus === "VERIFIED" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Verified
                </span>
              )}
              {kycStatus === "PENDING" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  ⏳ Yet to be verified
                </span>
              )}
              {kycStatus === "NOT_SUBMITTED" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Unverified
                </span>
              )}
              {kycStatus === "REJECTED" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  ✕ Rejected
                </span>
              )}
            </>
          )}
        </div>
        <p className="text-sm text-slate-500 font-mono">
          Customer ID: <span className="text-slate-700 font-semibold">{profile.CustID}</span> • Email: {profile.EmailId}
        </p>
      </div>

      {/* Top Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* KYC Action Button (Visible ONLY to Customers) */}
        {isCustomer && kycStatus !== "VERIFIED" && (
          <button
            onClick={onOpenKYC}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition border flex items-center gap-1.5 ${
              kycStatus === "PENDING"
                ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            }`}
          >
            <span>📋</span> {kycStatus === "PENDING" ? "Update KYC (Pending)" : "Complete KYC"}
          </button>
        )}

        <button
          onClick={onOpenDetails}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 flex items-center gap-1.5"
        >
          <span>👤</span> Customer Details
        </button>
        <button
          onClick={onOpenEdit}
          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};