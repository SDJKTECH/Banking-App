import React, { useState } from "react";
import { SearchCustomerParams } from "../../types/customer.types";

// Define TypeScript props interface for search filter callbacks and loading state
interface AdminSearchFiltersProps {
  loading: boolean;
  onSearchById: (custId: string) => void;
  onAdvancedSearch: (filters: SearchCustomerParams) => void;
}

// Render the search filters component supporting ID lookup and advanced multi-field search
export const AdminSearchFilters: React.FC<AdminSearchFiltersProps> = ({
  loading,
  onSearchById,
  onAdvancedSearch,
}) => {
  // State for direct customer ID input
  const [searchId, setSearchId] = useState("");
  // State for multi-parameter advanced filter inputs
  const [filters, setFilters] = useState<SearchCustomerParams>({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });

  // Handle direct customer ID search submission
  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchById(searchId.trim());
  };

  // Handle multi-criteria advanced filter search submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdvancedSearch(filters);
  };

  return (
    // Responsive grid layout splitting ID lookup and advanced filter sections
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
      {/* Customer ID direct search form section */}
      <form onSubmit={handleIdSubmit} className="space-y-3 lg:border-r lg:pr-6 border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Search by Customer ID
        </h3>
        {/* Monospace text input for pasting or typing customer ID */}
        <input
          type="text"
          placeholder="e.g. CUST-34434ab0-..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition"
        />
        {/* Submit button to trigger single customer lookup by ID */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:bg-slate-400"
        >
          {loading ? "Searching..." : "Lookup ID"}
        </button>
      </form>

      {/* Multi-parameter advanced filtering form spanning two columns on desktop */}
      <form onSubmit={handleFilterSubmit} className="lg:col-span-2 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Advanced Filter Lookup
        </h3>
        {/* Two-column responsive grid container for filter input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Controlled input field for filtering by first name */}
          <input
            placeholder="First Name"
            value={filters.firstName || ""}
            onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
            className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition"
          />
          {/* Controlled input field for filtering by last name */}
          <input
            placeholder="Last Name"
            value={filters.lastName || ""}
            onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
            className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition"
          />
          {/* Controlled input field for filtering by email address */}
          <input
            placeholder="Email Address"
            value={filters.email || ""}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition"
          />
          {/* Controlled input field for filtering by mobile phone number */}
          <input
            placeholder="Mobile Number"
            value={filters.mobile || ""}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
            className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition"
          />
        </div>
        {/* Right-aligned submission action container */}
        <div className="flex justify-end pt-1">
          {/* Submit button to execute multi-criteria customer search */}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition disabled:bg-blue-300 shadow-sm"
          >
            {loading ? "Searching..." : "Filter Customers"}
          </button>
        </div>
      </form>
    </div>
  );
};