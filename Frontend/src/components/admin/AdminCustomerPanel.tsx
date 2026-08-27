import React, { useState, useEffect, useCallback } from "react";
import { customerService } from "../../services/customer.service";
import { CustomerProfile, SearchCustomerParams } from "../../types/customer.types";
import { AdminSearchFilters } from "./AdminSearchFilters";
import { AdminCustomerTable } from "./AdminCustomerTable";
import { AdminEditCustomerModal } from "./AdminEditCustomerModal";
import { AdminKYCQueue } from "./AdminKYCQueue";
import { CustomerDetailsModal } from "../dashboard/CustomerDetailsModal";

export const AdminCustomerPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"SEARCH" | "KYC">("SEARCH");

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 1. Fetch all customers sorted alphabetically (A-Z)
  const fetchAllCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Empty query retrieves all customers without raising validation errors
      const res = await customerService.searchCustomers({});
      const sorted = (res.data || []).sort((a: CustomerProfile, b: CustomerProfile) =>
        (a.FirstName || "").localeCompare(b.FirstName || "") ||
        (a.LastName || "").localeCompare(b.LastName || "")
      );
      setCustomers(sorted);
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to load customers list");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load customers on mount
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Search by single Customer ID
  const handleSearchById = async (custId: string) => {
    setError(null);
    setSuccessMsg(null);

    if (!custId || !custId.trim()) {
      setError("Please enter a Customer ID to search.");
      return;
    }

    setLoading(true);
    try {
      const res = await customerService.getCustomerById(custId.trim());
      setCustomers([res.data]);
    } catch (err: any) {
      setCustomers([]);
      setError(typeof err === "string" ? err : `No customer found with ID '${custId}'`);
    } finally {
      setLoading(false);
    }
  };

  // Advanced multi-field search
  const handleAdvancedSearch = async (filters: SearchCustomerParams) => {
    setError(null);
    setSuccessMsg(null);

    const hasParam = Object.values(filters).some((val) => val && val.trim() !== "");
    
    // Only show validation warning if the user presses the button with all fields empty
    if (!hasParam) {
      setError("At least one search query parameter (firstName, lastName, mobile, email) must be provided to filter.");
      return;
    }

    setLoading(true);
    try {
      const res = await customerService.searchCustomers(filters);
      const sorted = (res.data || []).sort((a: CustomerProfile, b: CustomerProfile) =>
        (a.FirstName || "").localeCompare(b.FirstName || "") ||
        (a.LastName || "").localeCompare(b.LastName || "")
      );
      setCustomers(sorted);
      if (sorted.length === 0) {
        setError("No customers match your search criteria.");
      }
    } catch (err: any) {
      setCustomers([]);
      setError(typeof err === "string" ? err : "Failed to search customers");
    } finally {
      setLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (cust: CustomerProfile) => {
    const confirmDelete = window.confirm(
      `Delete customer ${cust.FirstName} ${cust.LastName} (${cust.CustID})?\n\nThis will permanently delete all associated accounts, KYC documents, and transaction histories.`
    );

    if (!confirmDelete) return;

    try {
      await customerService.deleteCustomer(cust.CustID);
      setCustomers((prev) => prev.filter((c) => c.CustID !== cust.CustID));
      setSuccessMsg(`Customer '${cust.CustID}' deleted successfully`);
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to delete customer");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("SEARCH");
            setError(null);
            setSuccessMsg(null);
            fetchAllCustomers();
          }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "SEARCH"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🔍 Customer Search & Records
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("KYC");
            setError(null);
            setSuccessMsg(null);
          }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "KYC"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📋 Pending KYC Queue
        </button>
      </div>

      {/* KYC Queue View */}
      {activeTab === "KYC" && <AdminKYCQueue />}

      {/* Customer Management View */}
      {activeTab === "SEARCH" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Customer Management Portal
                </h2>
                <p className="text-sm text-slate-500">
                  Search by Customer ID, apply filters, view details, update records, or delete accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAllCustomers}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition self-start sm:self-auto disabled:bg-slate-50"
              >
                {loading ? "Loading..." : "↻ Reset / Show All"}
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200">
                {successMsg}
              </div>
            )}

            <AdminSearchFilters
              loading={loading}
              onSearchById={handleSearchById}
              onAdvancedSearch={handleAdvancedSearch}
            />
          </div>

          {/* Customer Results Table */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Loading customers list...</p>
            </div>
          ) : customers.length > 0 ? (
            <AdminCustomerTable
              customers={customers}
              onView={(cust) => {
                setSelectedCustomer(cust);
                setIsDetailsOpen(true);
              }}
              onEdit={(cust) => {
                setSelectedCustomer(cust);
                setIsEditOpen(true);
              }}
              onDelete={handleDeleteCustomer}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 text-sm">
              No customers found.
            </div>
          )}
        </>
      )}

      {/* Details View Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          profile={selectedCustomer}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}

      {/* Edit Record Modal */}
      {selectedCustomer && (
        <AdminEditCustomerModal
          customer={selectedCustomer}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={(updated) => {
            setCustomers((prev) =>
              prev.map((c) =>
                c.CustID === updated.CustID ? { ...c, ...updated } : c
              )
            );
            setSuccessMsg(`Customer ${updated.CustID} updated successfully`);
          }}
        />
      )}
    </div>
  );
};