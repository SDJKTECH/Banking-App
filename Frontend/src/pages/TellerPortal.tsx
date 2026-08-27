// src/pages/TellerPortal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useTeller } from "../hooks/useTeller";
import { CustomerProfile, CustomerAccount } from "../types/customer.types";
import { ActiveTellerModal } from "../types/tellerUI.types";
import { TellerSidebar, SidebarTab } from "../components/teller/TellerSidebar";
import { CustomersTab } from "../components/teller/CustomersTab";
import { TellerKYCQueue } from "../components/teller/TellerKYCQueue";
import { GlobalStatementsTeller } from "../components/statements/GlobalStatements.teller";

// Modals
import { CustomerOnboardTeller } from "../components/customer/CustomerOnboard.teller";
import { CreateAccountModalTeller } from "../components/account/CreateAccountModal.teller";
import { CashActionModalTeller } from "../components/teller/CashActionModal.teller";
import { LoanGrantTeller } from "../components/loan/LoanGrant.teller";
import { PayEMIModalTeller } from "../components/loan/PayEMIModal";
import { CustomerDetailsModal } from "../components/dashboard/CustomerDetailsModal";
import { AdminEditCustomerModal } from "../components/admin/AdminEditCustomerModal";

export const TellerPortal: React.FC = () => {
  const {
    customers,
    pagination,
    selectedCustomer,
    setSelectedCustomer,
    statements,
    statementPagination, // 👈 Hook pagination state for audit ledger
    kycQueue,
    fetchKycQueue,
    approveKyc,
    rejectKyc,
    loading,
    error,
    successMessage,
    searchCustomers,
    onboardCustomer,
    createAccount,
    updateCustomer,
    deleteCustomer,
    closeAccount,
    depositCash,
    withdrawCash,
    transferFunds,
    fetchStatements,
    grantLoan,
    payLoanEMI,
  } = useTeller();

  const [activeTab, setActiveTab] = useState<SidebarTab>("CUSTOMERS");
  const [activeModal, setActiveModal] = useState<ActiveTellerModal>(null);

  // Local override state to allow manually clearing success banners on navigation
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  // Filter out internal bank staff from customer views
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (cust) => cust.User?.Role !== "ADMIN" && cust.User?.Role !== "BANK_TELLER"
    );
  }, [customers]);

  // Sync incoming hook success message into local display state
  useEffect(() => {
    if (successMessage) {
      setLocalSuccess(successMessage);
    }
  }, [successMessage]);

  useEffect(() => {
    searchCustomers({ page: 1, pageSize: 10 });
    fetchStatements({ limit: 10, page: 1, pageSize: 10 });
    fetchKycQueue();
  }, [searchCustomers, fetchStatements, fetchKycQueue]);

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      <TellerSidebar
        activeTab={activeTab}
        onSelectTab={(tab: SidebarTab) => {
          setActiveTab(tab);
          setSelectedCustomer(null);
          setLocalSuccess(null);
        }}
        onOpenOnboard={() => {
          setLocalSuccess(null);
          setActiveModal({ type: "ONBOARD" });
        }}
        customersCount={pagination.totalCount}
        pendingKycCount={kycQueue.length}
      />

      <main className="flex-1 overflow-y-auto p-8 relative">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium shadow-sm">
            {error}
          </div>
        )}

        {localSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl font-medium shadow-sm flex items-center justify-between">
            <span>{localSuccess}</span>
            <button
              onClick={() => setLocalSuccess(null)}
              className="text-emerald-900 font-bold hover:text-rose-600 ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Customer Directory & Linked Accounts */}
        {activeTab === "CUSTOMERS" && (
          <CustomersTab
            customers={filteredCustomers}
            pagination={pagination}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(cust) => {
              setSelectedCustomer(cust);
              setLocalSuccess(null);
            }}
            onSearch={searchCustomers}
            onViewDetails={(cust: CustomerProfile) => {
              setLocalSuccess(null);
              setActiveModal({ type: "VIEW_DETAILS", customer: cust });
            }}
            onEditCustomer={(cust: CustomerProfile) => {
              setLocalSuccess(null);
              setActiveModal({ type: "EDIT_CUSTOMER", customer: cust });
            }}
            onDeleteCustomer={deleteCustomer}
            onGrantLoan={(custId: string, acctNum?: string) => {
              setLocalSuccess(null);
              setActiveModal({ type: "GRANT_LOAN", custId, preselectedAcctNum: acctNum });
            }}
            onPayEMI={(
              acctNum: string,
              balance: number,
              customerName: string,
              rateOfInterest?: number,
              loanDuration?: number
            ) => {
              setLocalSuccess(null);
              setActiveModal({
                type: "PAY_EMI",
                acctNum,
                remainingBalance: balance,
                customerName,
                rateOfInterest: rateOfInterest ?? 8.5,
                loanDuration: loanDuration ?? 60,
              } as any);
            }}
            onOpenNewAccount={(cust: CustomerProfile) => {
              setLocalSuccess(null);
              setActiveModal({ type: "CREATE_ACCOUNT", customer: cust });
            }}
            onOpenDeposit={(acctNum: string, balance: number) => {
              setLocalSuccess(null);
              setActiveModal({ type: "CASH_ACTION", mode: "DEPOSIT", acctNum, balance });
            }}
            onOpenWithdraw={(acctNum: string, balance: number) => {
              setLocalSuccess(null);
              setActiveModal({ type: "CASH_ACTION", mode: "WITHDRAW", acctNum, balance });
            }}
            onOpenTransfer={(acctNum: string, balance: number) => {
              setLocalSuccess(null);
              setActiveModal({ type: "CASH_ACTION", mode: "TRANSFER", acctNum, balance });
            }}
            onCloseAccount={closeAccount}
          />
        )}

        {/* Tab 2: KYC Approval Queue */}
        {activeTab === "KYC_QUEUE" && (
          <TellerKYCQueue
            queue={kycQueue}
            loading={loading}
            onApprove={approveKyc}
            onReject={rejectKyc}
            onRefresh={fetchKycQueue}
          />
        )}

        {/* Tab 3: Statements & Audit Ledger (Paginated) */}
        {activeTab === "STATEMENTS" && (
          <GlobalStatementsTeller
            statements={statements}
            pagination={statementPagination} // 👈 Passed pagination metadata
            loading={loading}
            selectedAcctNum={selectedCustomer?.Accounts?.[0]?.AcctNum}
            onFetchStatements={fetchStatements}
          />
        )}

        {/* ================= MODAL MANAGER ================= */}
        {activeModal?.type === "ONBOARD" && (
          <CustomerOnboardTeller
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onSubmit={async (payload: any) => {
              await onboardCustomer(payload);
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === "CREATE_ACCOUNT" && (
          <CreateAccountModalTeller
            isOpen={true}
            custId={activeModal.customer.CustID}
            customerName={`${activeModal.customer.FirstName} ${activeModal.customer.LastName}`}
            onClose={() => setActiveModal(null)}
            onSubmit={async (payload: any) => {
              await createAccount(payload);
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === "VIEW_DETAILS" && (
          <CustomerDetailsModal
            isOpen={true}
            profile={activeModal.customer}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal?.type === "EDIT_CUSTOMER" && (
          <AdminEditCustomerModal
            isOpen={true}
            customer={activeModal.customer}
            onClose={() => setActiveModal(null)}
            onSuccess={async (updated: any) => {
              await updateCustomer(updated.CustID, updated);
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === "CASH_ACTION" && (
          <CashActionModalTeller
            isOpen={true}
            initialMode={activeModal.mode}
            acctNum={activeModal.acctNum}
            currentBalance={activeModal.balance}
            onClose={() => setActiveModal(null)}
            onDeposit={depositCash}
            onWithdraw={withdrawCash}
            onTransfer={transferFunds}
          />
        )}

        {activeModal?.type === "GRANT_LOAN" && (
          <LoanGrantTeller
            isOpen={true}
            custId={activeModal.custId || ""}
            preselectedAcctNum={activeModal.preselectedAcctNum || ""}
            onClose={() => setActiveModal(null)}
            onGrantLoan={async (payload: any) => {
              await grantLoan(payload);
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === "PAY_EMI" && (
          <PayEMIModalTeller
            isOpen={true}
            acctNum={activeModal.acctNum}
            remainingBalance={activeModal.remainingBalance}
            customerName={activeModal.customerName}
            rateOfInterest={(activeModal as any).rateOfInterest || 8.5}
            loanDuration={(activeModal as any).loanDuration || 60}
            onClose={() => setActiveModal(null)}
            onPayEMI={async (payload: any) => {
              const res = await payLoanEMI(payload);
              setActiveModal(null);
              return res;
            }}
          />
        )}
      </main>
    </div>
  );
};