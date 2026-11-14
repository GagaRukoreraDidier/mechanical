"use client"

import Link from "next/link"
import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatCard } from "@/components/ui/StatCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { ServiceRequest, AnalyticsMetrics } from "@/types"
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  Send,
  Link2,
  Users,
  Coins,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"

export default function AdminDashboardPage() {
  const { data: analytics } = useSWR<{ metrics: AnalyticsMetrics }>("/admin-panel/analytics/")
  const { data: requestsData, isLoading } = useSWR<{ results: ServiceRequest[] }>("/requests/")

  const metrics = analytics?.metrics
  const requests = requestsData?.results || []

  // Requests needing moderation / review
  const pendingReview = requests.filter((r) => ["SUBMITTED", "UNDER_REVIEW"].includes(r.status))

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeading
        icon={LayoutDashboard}
        title="Admin Control Center"
        subtitle="Marketplace operations, request moderation, provider matching & revenue monitoring"
      />

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard
          icon={ClipboardList}
          label="Total Requests"
          value={metrics?.total_requests ?? requests.length}
          hint="lifetime"
        />
        <StatCard
          icon={Clock}
          label="Under Review"
          value={metrics?.under_review_requests ?? pendingReview.length}
          hint="needs review"
          tone="amber"
        />
        <StatCard
          icon={Send}
          label="Published"
          value={metrics?.published_requests ?? 0}
          hint="awaiting quotes"
          tone="brand"
        />
        <StatCard
          icon={Link2}
          label="Unlocked"
          value={metrics?.unlocked_connections ?? 0}
          hint="connections"
          tone="blue"
        />
        <StatCard
          icon={Users}
          label="Active Providers"
          value={metrics?.active_providers ?? 0}
          hint="garages/mechanics"
        />
        <StatCard
          icon={Coins}
          label="Platform Revenue"
          value={`RWF ${(metrics?.total_revenue_rwf || 0).toLocaleString()}`}
          hint="fees collected"
          tone="green"
        />
      </div>

      {/* Requests Needing Action Queue */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fef3c7] text-[#92400e]">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#010313]">Requests Needing Moderation</h2>
              <p className="text-[12px] text-[#6b7280]">
                Customer submissions ready for administrative review, category validation, or publication
              </p>
            </div>
          </div>
          <Link
            href="/admin/requests"
            className="text-[12px] font-semibold text-[#1a6c80] hover:underline flex items-center gap-1"
          >
            Open Queue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[13px] text-[#9ca3af]">Loading moderation queue...</div>
        ) : pendingReview.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#047857] bg-[#ecfdf5]/40">
            ✓ All incoming customer requests have been moderated and published!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Request Details
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Category & Location
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Current Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Urgency
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Moderate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {pendingReview.slice(0, 5).map((req) => (
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
                      <span className="text-[11px] font-bold uppercase text-[#be123c]">
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-3.5 py-1.5 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all"
                      >
                        Moderate
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
