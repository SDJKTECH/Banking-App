// src/components/DashboardPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useCustomer } from "../hooks/useCustomer";
import { KYCRecord } from "../types/customer.types";
import { kycService } from "../services/kyc.service";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { AccountCard } from "../components/dashboard/AccountCard";
import { DashboardModals } from "../components/dashboard/DashboardModals";

export const DashboardPage: React.FC = () => {
  const { profile, loading, error, updateProfile, refetchProfile } = useCustomer();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [kycData, setKycData] = useState<KYCRecord | null>(null);

  const [selectedSaving, setSelectedSaving] = useState<{
    acctNum: string;
    balance: number;
    limit: number;
  } | null>(null);
  
  const [activeTxnModal, setActiveTxnModal] = useState<
    "DEPOSIT" | "TRANSFER" | "HISTORY" | null
  >(null);

  // Fetch KYC details for the authenticated customer
  const fetchKYC = useCallback(async () => {
    if (profile?.CustID) {
      try {
        const res = await kycService.getKYC(profile.CustID);
        // Handle both standard axios response { data: ... } or direct data return
        setKycData(res.data || res);
      } catch (err) {
        console.error("Failed to fetch KYC record:", err);
      }
    }
  }, [profile?.CustID]);

  // Re-fetch KYC data and profile whenever customer ID loads or changes
  useEffect(() => {
    fetchKYC();
  }, [fetchKYC]);

  const handleOpenAction = (
    action: "DEPOSIT" | "TRANSFER" | "HISTORY",
    data: { acctNum: string; balance: number; limit: number }
  ) => {
    setSelectedSaving(data);
    setActiveTxnModal(action);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="font-bold text-lg mb-1">Failed to load dashboard</h3>
        <p className="text-sm">{error || "Could not retrieve account details"}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top dashboard header with user profile overview and action triggers */}
        <DashboardHeader
          profile={profile}
          kycData={kycData}
          onOpenKYC={() => setIsKYCOpen(true)}
          onOpenDetails={() => setIsDetailsOpen(true)}
          onOpenEdit={() => setIsEditOpen(true)}
        />

        {/* Linked bank accounts section */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Linked Bank Accounts</h2>
          {profile.Accounts && profile.Accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.Accounts.map((account) => (
                <AccountCard
                  key={account.AcctNum}
                  account={account}
                  onOpenAction={handleOpenAction}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-200">
              No linked bank accounts found.
            </p>
          )}
        </div>

        {/* Central modal manager handling all popups and lifecycle callbacks */}
        <DashboardModals
          profile={profile}
          kycData={kycData}
          isKYCOpen={isKYCOpen}
          isDetailsOpen={isDetailsOpen}
          isEditOpen={isEditOpen}
          selectedSaving={selectedSaving}
          activeTxnModal={activeTxnModal}
          onCloseKYC={() => setIsKYCOpen(false)}
          onCloseDetails={() => setIsDetailsOpen(false)}
          onCloseEdit={() => setIsEditOpen(false)}
          onCloseTxnModal={() => setActiveTxnModal(null)}
          onUpdateProfile={updateProfile}
          onRefreshProfile={async () => {
            await refetchProfile();
            await fetchKYC();
          }}
          onRefreshKYC={fetchKYC}
        />
      </div>
    </div>
  );
};