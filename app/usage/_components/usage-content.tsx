"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Loader2,
  Coins,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Gift,
  RotateCcw,
  X,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsage } from "@/hooks";
import { useUserStore, selectCredits } from "@/store";
import type { UsageEntry, UsageFilters } from "@/lib/api";

// ============================================================================
// Constants
// ============================================================================

const TRANSACTION_TYPES: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  subscription_credit: { label: "Subscription", icon: CreditCard, color: "text-green-400 bg-green-400/10" },
  subscription_renewal: { label: "Renewal", icon: RefreshCw, color: "text-green-400 bg-green-400/10" },
  addon_purchase: { label: "Add-on", icon: Coins, color: "text-blue-400 bg-blue-400/10" },
  usage_deduction: { label: "Usage", icon: Sparkles, color: "text-orange-400 bg-orange-400/10" },
  refund: { label: "Refund", icon: RotateCcw, color: "text-purple-400 bg-purple-400/10" },
  manual_adjustment: { label: "Adjustment", icon: ArrowUpDown, color: "text-gray-400 bg-gray-400/10" },
  bonus: { label: "Bonus", icon: Gift, color: "text-yellow-400 bg-yellow-400/10" },
  expiry: { label: "Expired", icon: Clock, color: "text-red-400 bg-red-400/10" },
  rollback: { label: "Rollback", icon: RotateCcw, color: "text-gray-400 bg-gray-400/10" },
  sync_adjustment: { label: "Sync", icon: RefreshCw, color: "text-cyan-400 bg-cyan-400/10" },
};

const TRANSACTION_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "reversed", label: "Reversed" },
];

// ============================================================================
// Types
// ============================================================================

interface Filters {
  type: string;
  direction: "all" | "credit" | "debit";
  status: string;
  startDate: string;
  endDate: string;
  search: string;
  sortBy: "createdAt" | "amount" | "balance_after";
  sortOrder: "asc" | "desc";
}

// ============================================================================
// Helper Functions
// ============================================================================

function getTypeConfig(type: string) {
  return TRANSACTION_TYPES[type] || { 
    label: type.replace(/_/g, " "), 
    icon: Coins, 
    color: "text-gray-400 bg-gray-400/10" 
  };
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
    case "pending":
      return <Clock className="w-3.5 h-3.5 text-yellow-400" />;
    case "failed":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case "reversed":
      return <RotateCcw className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <AlertCircle className="w-3.5 h-3.5 text-gray-400" />;
  }
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

// ============================================================================
// Sub-components
// ============================================================================

function SummaryCard({ icon, label, value, valueColor = "text-white" }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="bg-[#151515] border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 text-white/50 text-sm mb-2">{icon}{label}</div>
      <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
    </div>
  );
}

function TransactionRow({ entry }: { entry: UsageEntry }) {
  const typeConfig = getTypeConfig(entry.type);
  const TypeIcon = typeConfig.icon;
  const isCredit = entry.amount > 0;

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeConfig.color)}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[280px]">{entry.description}</p>
            <p className="text-xs text-white/40 font-mono">{entry.transaction_ref.slice(0, 20)}...</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", typeConfig.color)}>
          {typeConfig.label}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <span className={cn("font-semibold", isCredit ? "text-green-400" : "text-red-400")}>
          {isCredit ? "+" : ""}{entry.amount.toLocaleString()}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <span className="text-white/70">{entry.balance_after.toLocaleString()}</span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          {getStatusIcon(entry.status)}
          <span className="text-sm text-white/60 capitalize">{entry.status}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        <p className="text-sm text-white/70">{formatRelativeTime(entry.created_at)}</p>
        <p className="text-xs text-white/40">{formatDate(entry.created_at)}</p>
      </td>
    </tr>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function UsageContent() {
  const credits = useUserStore(selectCredits);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const [filters, setFilters] = useState<Filters>({
    type: "",
    direction: "all",
    status: "",
    startDate: "",
    endDate: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const queryFilters: UsageFilters = useMemo(() => ({
    page,
    limit,
    type: filters.type || undefined,
    direction: filters.direction,
    status: filters.status || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }), [filters, page, limit]);

  const { data: usageData, isLoading, isFetching, refetch } = useUsage(queryFilters);

  const hasActiveFilters = filters.type || filters.direction !== "all" || filters.status || 
    filters.startDate || filters.endDate || filters.search;

  const clearFilters = useCallback(() => {
    setFilters({
      type: "",
      direction: "all",
      status: "",
      startDate: "",
      endDate: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPage(1);
  }, []);

  const exportToCsv = () => {
    if (!usageData?.entries.length) return;

    const headers = ["Date", "Type", "Description", "Amount", "Balance After", "Status"];
    const rows = usageData.entries.map(entry => [
      formatDate(entry.created_at),
      getTypeConfig(entry.type).label,
      entry.description,
      entry.amount.toString(),
      entry.balance_after.toString(),
      entry.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credit-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Credit Usage</h1>
          <p className="text-white/60">Track your credit history and usage patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} disabled={isFetching} className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50" title="Refresh">
            <RefreshCw className={cn("w-5 h-5", isFetching && "animate-spin")} />
          </button>
          <button onClick={exportToCsv} disabled={!usageData?.entries.length} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<Coins className="w-4 h-4" />} label="Current Balance" value={credits.toLocaleString()} valueColor="text-[#74FF52]" />
        <SummaryCard icon={<ArrowDownLeft className="w-4 h-4 text-green-400" />} label="Credited" value={`+${(usageData?.summary.total_credited || 0).toLocaleString()}`} valueColor="text-green-400" />
        <SummaryCard icon={<ArrowUpRight className="w-4 h-4 text-red-400" />} label="Used" value={`-${(usageData?.summary.total_debited || 0).toLocaleString()}`} valueColor="text-red-400" />
        <SummaryCard 
          icon={(usageData?.summary.net_change || 0) >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />} 
          label="Net Change" 
          value={`${(usageData?.summary.net_change || 0) >= 0 ? "+" : ""}${(usageData?.summary.net_change || 0).toLocaleString()}`} 
          valueColor={(usageData?.summary.net_change || 0) >= 0 ? "text-green-400" : "text-red-400"} 
        />
      </div>

      {/* Filters */}
      <div className="bg-[#151515] border border-white/10 rounded-xl mb-6">
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#74FF52]/50"
            />
          </div>

          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {(["all", "credit", "debit"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => { setFilters(f => ({ ...f, direction: dir })); setPage(1); }}
                className={cn("px-4 py-2 text-sm font-medium transition-colors", filters.direction === dir ? "bg-white text-black" : "bg-transparent text-white/70 hover:text-white hover:bg-white/5")}
              >
                {dir === "all" ? "All" : dir === "credit" ? "Credits" : "Debits"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors", showFilters || hasActiveFilters ? "border-[#74FF52]/50 text-[#74FF52] bg-[#74FF52]/10" : "border-white/10 text-white/70 hover:text-white hover:bg-white/5")}
          >
            <Filter className="w-4 h-4" />Filters{hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#74FF52]" />}
          </button>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => { const [sortBy, sortOrder] = e.target.value.split("-") as [Filters["sortBy"], Filters["sortOrder"]]; setFilters(f => ({ ...f, sortBy, sortOrder })); }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#74FF52]/50 cursor-pointer"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>

        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-white/10 flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-xs text-white/50 mb-1">Type</label>
              <select value={filters.type} onChange={(e) => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#74FF52]/50 cursor-pointer">
                <option value="">All Types</option>
                {Object.entries(TRANSACTION_TYPES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Status</label>
              <select value={filters.status} onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#74FF52]/50 cursor-pointer">
                {TRANSACTION_STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">From</label>
              <input type="date" value={filters.startDate} onChange={(e) => { setFilters(f => ({ ...f, startDate: e.target.value })); setPage(1); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#74FF52]/50" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">To</label>
              <input type="date" value={filters.endDate} onChange={(e) => { setFilters(f => ({ ...f, endDate: e.target.value })); setPage(1); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#74FF52]/50" />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors mt-auto">
                <X className="w-4 h-4" />Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#74FF52] mx-auto" /></div>
        ) : usageData?.entries.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 mb-2">No transactions found</p>
            {hasActiveFilters && <button onClick={clearFilters} className="text-[#74FF52] hover:underline text-sm">Clear filters to see all</button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Transaction</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Balance</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usageData?.entries.map((entry) => <TransactionRow key={entry.id} entry={entry} />)}
                </tbody>
              </table>
            </div>

            {usageData && usageData.pagination.total_pages > 1 && (
              <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-sm text-white/50">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, usageData.pagination.total)} of {usageData.pagination.total.toLocaleString()} transactions</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={!usageData.pagination.has_prev} className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, usageData.pagination.total_pages) }, (_, i) => {
                      let pageNum: number;
                      const totalPages = usageData.pagination.total_pages;
                      if (totalPages <= 5) { pageNum = i + 1; }
                      else if (page <= 3) { pageNum = i + 1; }
                      else if (page >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                      else { pageNum = page - 2 + i; }
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)} className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors", page === pageNum ? "bg-white text-black" : "hover:bg-white/10 text-white/70")}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setPage(p => p + 1)} disabled={!usageData.pagination.has_next} className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
