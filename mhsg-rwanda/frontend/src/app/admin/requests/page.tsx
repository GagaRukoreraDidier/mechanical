"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SearchInput } from "@/components/ui/SearchInput"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ServiceRequest } from "@/types"
import { ClipboardList, ArrowRight, Filter } from "lucide-react"

export default function AdminRequestsQueuePage() {
  const [tab, setTab] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  const { data: requestsData, isLoading } = useSWR<{ results: ServiceRequest[] }>("/requests/")
  const requests = requestsData?.results || []

  const filtered = requests.filter((r) => {
    if (search) {
      const q = search.toLowerCase()
      const matchDesc = r.description.toLowerCase().includes(q)
      const matchDist = r.district.toLowerCase().includes(q)
      const matchId = r.id.toLowerCase().includes(q)
      if (!matchDesc && !matchDist && !matchId) return false
    }

    if (tab === "REVIEW") {
      return ["SUBMITTED", "UNDER_REVIEW"].includes(r.status)
    }
    if (tab === "PUBLISHED") {
      return ["READY_TO_PUBLISH", "PUBLISHED", "OFFERS_RECEIVED"].includes(r.status)
    }
    if (tab === "APPROVAL") {
      return ["AWAITING_CUSTOMER_APPROVAL", "CUSTOMER_APPROVED"].includes(r.status)
    }
    if (tab === "ACTIVE") {
      return ["AWAITING_CONNECTION_PAYMENT", "CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED"].includes(r.status)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeading
        icon={ClipboardList}
        title="Requests Moderation Queue"
        subtitle="Manage and moderate all platform incoming requests across Rwandan districts"
      />

      <div className="rounded-2xl border border-[#ececf0] bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#e6e8ec] px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Requests", count: requests.length },
              { id: "REVIEW", label: "Needs Moderation", count: requests.filter((r) => ["SUBMITTED", "UNDER_REVIEW"].includes(r.status)).length },
              { id: "PUBLISHED", label: "Published / Offers", count: requests.filter((r) => ["PUBLISHED", "OFFERS_RECEIVED"].includes(r.status)).length },
              { id: "APPROVAL", label: "Awaiting Approval", count: requests.filter((r) => ["AWAITING_CUSTOMER_APPROVAL", "CUSTOMER_APPROVED"].includes(r.status)).length },
              { id: "ACTIVE", label: "Active Connections", count: requests.filter((r) => ["CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED"].includes(r.status)).length },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
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

          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request ID, district, text..."
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center text-[13px] text-[#9ca3af]">Loading requests queue...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching requests found"
            description="Adjust your search criteria or review filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Request & Requester
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    District
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Urgency
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase text-[#7c3aed]">
                          REQ-{req.id.slice(0, 8)}
                        </span>
                        <div className="text-[13px] font-semibold text-[#010313] line-clamp-1">
                          {req.description}
                        </div>
                        {req.customer_name && (
                          <div className="text-[11px] text-[#6b7280]">Customer: {req.customer_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[12px] font-semibold text-[#010313]">
                      {req.district}, {req.province}
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#4b5563]">
                      {req.category_name}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-bold uppercase text-[#be123c]">
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1a6c80] hover:border-[#23A6BD] hover:bg-[#23A6BD] hover:text-[#010313] transition-all shadow-sm"
                      >
                        Manage
                        <ArrowRight className="h-3.5 w-3.5" />
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
