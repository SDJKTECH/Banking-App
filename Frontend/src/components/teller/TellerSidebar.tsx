// src/components/teller/TellerSidebar.tsx
import React from "react";

export type SidebarTab = "CUSTOMERS" | "KYC_QUEUE" | "STATEMENTS";

interface TellerSidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onOpenOnboard: () => void;
  customersCount?: number;
  pendingKycCount?: number;
}

export const TellerSidebar: React.FC<TellerSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenOnboard,
  pendingKycCount = 0,
}) => {
  const navItems: { id: SidebarTab; label: string; icon: string; count?: number }[] = [
    { id: "CUSTOMERS", label: "Customers & Operations", icon: "👥" },
    { id: "KYC_QUEUE", label: "KYC Approval Queue", icon: "🛡️", count: pendingKycCount },
    { id: "STATEMENTS", label: "Audit Ledger & Statements", icon: "📊" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-full shrink-0 shadow-sm">
      <div className="p-4 space-y-6">
        {/* Portal Branding */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-600/20">
            JK
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Teller Terminal</h2>
            <p className="text-[11px] text-blue-600 font-medium">JK Core Banking</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      item.id === "KYC_QUEUE"
                        ? "bg-rose-500 text-white animate-pulse"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
        <button
          type="button"
          onClick={onOpenOnboard}
          className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Onboard New Customer</span>
        </button>
      </div>
    </aside>
  );
};