"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SearchInput } from "@/components/ui/SearchInput"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ServiceRequest } from "@/types"
import { FileText, Plus, Filter } from "lucide-react"

export default function CustomerRequestsPage() {
  const [tab, setTab] = useState<"ALL" | "ACTIVE" | "OFFERS" | "CONNECTED" | "COMPLETED">("ALL")
  const [search, setSearch] = useState("")

  const { data: requestsData, isLoading } = useSWR<{ results: ServiceRequest[] }>("/requests/")
  const allRequests = requestsData?.results || []

  const filteredRequests = allRequests.filter((r) => {
    // Search
    if (search) {
      const q = search.toLowerCase()
      const matchDesc = r.description.toLowerCase().includes(q)
      const matchMake = r.vehicle_make?.toLowerCase().includes(q)
      const matchPart = r.part_name?.toLowerCase().includes(q)
      const matchId = r.id.toLowerCase().includes(q)
      if (!matchDesc && !matchMake && !matchPart && !matchId) return false
    }

    // Tabs
    if (tab === "ACTIVE") {
      return ["DRAFT", "AWAITING_REQUEST_PAYMENT", "SUBMITTED", "UNDER_REVIEW", "PUBLISHED"].includes(r.status)
    }
    if (tab === "OFFERS") {
      return ["OFFERS_RECEIVED", "AWAITING_CUSTOMER_APPROVAL", "CUSTOMER_APPROVED"].includes(r.status)
    }
    if (tab === "CONNECTED") {
      return ["AWAITING_CONNECTION_PAYMENT", "CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED"].includes(r.status)
    }
    if (tab === "COMPLETED") {
      return ["COMPLETED", "CLOSED"].includes(r.status)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeading
        icon={FileText}
        title="My Requests"
        subtitle="Track your submissions, compare provider offers, and manage connections"
        actions={
          <Link
            href="/customer/requests/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-3.5 py-1.5 text-[13px] font-semibold text-[#010313] hover:border-[#1a879c] hover:bg-[#1a879c] shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        }
      />

      {/* Main Container Card */}
      <div className="rounded-2xl border border-[#ececf0] bg-white shadow-sm overflow-hidden">
        {/* Card Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#e6e8ec] px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Requests", count: allRequests.length },
              { id: "ACTIVE", label: "In Review / Matching", count: allRequests.filter((r) => ["DRAFT", "AWAITING_REQUEST_PAYMENT", "SUBMITTED", "UNDER_REVIEW", "PUBLISHED"].includes(r.status)).length },
              { id: "OFFERS", label: "Offers Ready", count: allRequests.filter((r) => ["OFFERS_RECEIVED", "AWAITING_CUSTOMER_APPROVAL"].includes(r.status)).length },
              { id: "CONNECTED", label: "Connected", count: allRequests.filter((r) => ["CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED"].includes(r.status)).length },
              { id: "COMPLETED", label: "Completed", count: allRequests.filter((r) => r.status === "COMPLETED").length },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  tab === t.id
                    ? "bg-[#23A6BD] text-[#010313]"
                    : "text-[#4b5563] hover:bg-[#f3f4f6]"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tab === t.id ? "bg-white/30 text-[#010313]" : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, vehicle, part..."
            />
          </div>
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="p-12 text-center text-[13px] text-[#9ca3af]">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            title="No matching requests found"
            description="Adjust your search filter or create a new request."
            actionLabel="Create New Request"
            onAction={() => window.location.assign("/customer/requests/new")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Request & Vehicle
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Category & Location
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Fee Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Submitted
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase text-[#7c3aed]">
                          REQ-{req.id.slice(0, 8)}
                        </span>
                        <div className="text-[13px] font-semibold text-[#010313] line-clamp-1">
                          {req.description}
                        </div>
                        {req.vehicle_make && (
                          <div className="text-[11px] text-[#6b7280]">
                            {req.vehicle_make} {req.vehicle_model} {req.vehicle_year && `(${req.vehicle_year})`}
                          </div>
                        )}
                        {req.part_name && (
                          <div className="text-[11px] text-[#6b7280]">
                            Part: {req.part_name} (Qty: {req.quantity || 1})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[12px] font-semibold text-[#010313]">{req.category_name}</div>
                      <div className="text-[11px] text-[#6b7280]">{req.district}, {req.province}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          req.fee_status === "SUCCEEDED"
                            ? "bg-[#ecfdf5] text-[#047857]"
                            : "bg-[#fef3c7] text-[#92400e]"
                        }`}
                      >
                        {req.fee_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#6b7280]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/customer/requests/${req.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1 text-[12px] font-semibold text-[#1a6c80] hover:border-[#23A6BD] hover:bg-[#23A6BD] hover:text-[#010313] shadow-sm transition-all"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
