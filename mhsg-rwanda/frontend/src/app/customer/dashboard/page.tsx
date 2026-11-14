"use client"

import Link from "next/link"
import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatCard } from "@/components/ui/StatCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ServiceRequest } from "@/types"
import {
  LayoutDashboard,
  FileText,
  Clock,
  Link2,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react"

export default function CustomerDashboardPage() {
  const { data: requestsData, isLoading } = useSWR<{ results: ServiceRequest[] }>("/requests/")
  const requests = requestsData?.results || []

  const activeCount = requests.filter(
    (r) => !["COMPLETED", "CANCELLED", "CLOSED"].includes(r.status)
  ).length
  const offersCount = requests.filter(
    (r) => ["OFFERS_RECEIVED", "AWAITING_CUSTOMER_APPROVAL"].includes(r.status)
  ).length
  const connectedCount = requests.filter(
    (r) => ["CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED"].includes(r.status)
  ).length
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeading
        icon={LayoutDashboard}
        title="Customer Dashboard"
        subtitle="Manage your mechanical, spare parts, and home technician requests"
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

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Clock}
          label="Active Requests"
          value={activeCount}
          hint="in matching or review"
          tone="brand"
        />
        <StatCard
          icon={FileText}
          label="Awaiting Approval"
          value={offersCount}
          hint="offers ready"
          tone="amber"
        />
        <StatCard
          icon={Link2}
          label="Connected Providers"
          value={connectedCount}
          hint="contact unlocked"
          tone="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
          hint="lifetime requests"
          tone="green"
        />
      </div>

      {/* Recent Requests Section */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#010313]">Recent Requests</h2>
              <p className="text-[12px] text-[#6b7280]">Latest service and parts discovery workflows</p>
            </div>
          </div>
          <Link
            href="/customer/requests"
            className="text-[12px] font-semibold text-[#1a6c80] hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[13px] text-[#9ca3af]">Loading requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No service requests yet"
            description="Create your first request to connect with verified garages, mechanics, or spare-parts suppliers in Rwanda."
            actionLabel="Create Request"
            onAction={() => window.location.assign("/customer/requests/new")}
          />
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
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Urgency
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {requests.slice(0, 5).map((req) => (
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
                      <span className="text-[11px] font-bold uppercase text-[#4b5563]">
                        {req.urgency}
                      </span>
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
      </section>
    </div>
  )
}
