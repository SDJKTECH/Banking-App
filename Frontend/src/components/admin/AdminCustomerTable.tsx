import React from "react";
import { CustomerProfile } from "../../types/customer.types";

// Define the TypeScript interface for customer table props and action callbacks
interface AdminCustomerTableProps {
  customers: CustomerProfile[];
  onView: (customer: CustomerProfile) => void;
  onEdit: (customer: CustomerProfile) => void;
  onDelete: (customer: CustomerProfile) => void;
}

// Render the customer data table component for the admin management view
export const AdminCustomerTable: React.FC<AdminCustomerTableProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    // Outer card container with rounded borders, shadow, and overflow containment
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table header displaying total number of matched customer records */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Found Customers ({customers.length})</h3>
      </div>

      {/* Horizontally scrollable wrapper for wide table layouts */}
      <div className="overflow-x-auto">
        {/* Full-width data table for listing customer details */}
        <table className="w-full text-left text-sm">
          {/* Table header defining column titles and formatting */}
          <thead className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3.5">Customer ID</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Contact Details</th>
              <th className="px-6 py-3.5">Location</th>
              <th className="px-6 py-3.5">Linked Accounts</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          {/* Table body rendering individual customer rows */}
          <tbody className="divide-y divide-slate-100">
            {/* Map over the customer collection to generate table rows */}
            {customers.map((c) => (
              <tr key={c.CustID} className="hover:bg-slate-50/60 transition">
                {/* Monospace customer identifier cell */}
                <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-800">
                  {c.CustID}
                </td>
                {/* Full name cell combining first and last name */}
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {c.FirstName} {c.LastName}
                </td>
                {/* Stacked email and mobile contact details cell */}
                <td className="px-6 py-4 text-xs space-y-0.5">
                  <div className="text-slate-800">{c.EmailId}</div>
                  <div className="text-slate-500 font-mono">{c.Mobile}</div>
                </td>
                {/* City and state geographic location cell with fallback */}
                <td className="px-6 py-4 text-xs text-slate-600">
                  {c.City || "N/A"}, {c.State || "N/A"}
                </td>
                {/* Linked bank accounts count badge or empty state fallback */}
                <td className="px-6 py-4 text-xs font-mono">
                  {c.Accounts && c.Accounts.length > 0 ? (
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
                      {c.Accounts.length} Account(s)
                    </span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>
                {/* Row action controls container */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* View full customer details button */}
                    <button
                      onClick={() => onView(c)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      View
                    </button>
                    {/* Edit customer profile button */}
                    <button
                      onClick={() => onEdit(c)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                    >
                      Edit
                    </button>
                    {/* Delete customer record button */}
                    <button
                      onClick={() => onDelete(c)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};