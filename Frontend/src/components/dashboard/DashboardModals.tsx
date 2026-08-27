import React from "react";
import { CustomerProfile, KYCRecord, UpdateCustomerPayload } from "../../types/customer.types";
import { CustomerDetailsModal } from "./CustomerDetailsModal";
import { EditProfileModal } from "./EditProfileModal";
import { KYCModal } from "./KYCModal";
import { Deposit } from "./Deposit";
import { Transfer } from "./Transfer";
import { TransactionHistoryModal } from "./TransactionHistoryModal";

// Define the TypeScript interface for dashboard modal state and handler props
interface DashboardModalsProps {
  profile: CustomerProfile;
  kycData: KYCRecord | null;
  isKYCOpen: boolean;
  isDetailsOpen: boolean;
  isEditOpen: boolean;
  selectedSaving: { acctNum: string; balance: number; limit: number } | null;
  activeTxnModal: "DEPOSIT" | "TRANSFER" | "HISTORY" | null;
  onCloseKYC: () => void;
  onCloseDetails: () => void;
  onCloseEdit: () => void;
  onCloseTxnModal: () => void;
  onUpdateProfile: (payload: UpdateCustomerPayload) => Promise<any>;
  onRefreshProfile: () => void;
  onRefreshKYC: () => void;
}

// Render the centralized container orchestrating all dashboard modals and dialogs
export const DashboardModals: React.FC<DashboardModalsProps> = ({
  profile,
  kycData,
  isKYCOpen,
  isDetailsOpen,
  isEditOpen,
  selectedSaving,
  activeTxnModal,
  onCloseKYC,
  onCloseDetails,
  onCloseEdit,
  onCloseTxnModal,
  onUpdateProfile,
  onRefreshProfile,
  onRefreshKYC,
}) => {
  return (
    // React Fragment to group multiple modal dialogs without extra DOM nodes
    <>
      {/* Modal for viewing and updating customer KYC verification records */}
      <KYCModal
        custId={profile.CustID}
        currentKYC={kycData}
        isOpen={isKYCOpen}
        onClose={onCloseKYC}
        onSuccess={onRefreshKYC}
      />

      {/* Modal for displaying complete customer profile details */}
      <CustomerDetailsModal
        profile={profile}
        isOpen={isDetailsOpen}
        onClose={onCloseDetails}
      />

      {/* Modal for editing and submitting updated customer profile data */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditOpen}
        onClose={onCloseEdit}
        onUpdate={onUpdateProfile}
      />

      {/* Render account-specific transaction modals only when a savings account is selected */}
      {selectedSaving && (
        <>
          {/* Modal for processing account deposit transactions */}
          <Deposit
            acctNum={selectedSaving.acctNum}
            currentBalance={selectedSaving.balance}
            isOpen={activeTxnModal === "DEPOSIT"}
            onClose={onCloseTxnModal}
            onSuccess={onRefreshProfile}
          />
          {/* Modal for initiating fund transfers to other accounts */}
          <Transfer
            sourceAcctNum={selectedSaving.acctNum}
            currentBalance={selectedSaving.balance}
            transferLimit={selectedSaving.limit}
            isOpen={activeTxnModal === "TRANSFER"}
            onClose={onCloseTxnModal}
            onSuccess={onRefreshProfile}
          />
          {/* Modal for listing past transaction records for the active account */}
          <TransactionHistoryModal
            acctNum={selectedSaving.acctNum}
            isOpen={activeTxnModal === "HISTORY"}
            onClose={onCloseTxnModal}
          />
        </>
      )}
    </>
  );
};