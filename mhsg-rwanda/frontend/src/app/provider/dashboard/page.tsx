"use client"

import Link from "next/link"
import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatCard } from "@/components/ui/StatCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ServiceRequest, ProviderOffer, Connection } from "@/types"
import {
  LayoutDashboard,
  Bell,
  Star,
  Link2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
} from "lucide-react"

export default function ProviderDashboardPage() {
  const { data: requestsData, isLoading } = useSWR<{ results: ServiceRequest[] }>("/requests/")
  const { data: offersData } = useSWR<{ results: ProviderOffer[] }>("/offers/")
  const { data: connectionsData } = useSWR<{ results: Connection[] }>("/connections/")

  const requests = requestsData?.results || []
  const offers = offersData?.results || []
  const connections = connectionsData?.results || []

  // Published requests available to quote
  const availableToQuote = requests.filter((r) => ["PUBLISHED", "OFFERS_RECEIVED"].includes(r.status))

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeading
        icon={LayoutDashboard}
        title="Provider Portal"
        subtitle="Respond to matching customer requests, submit transparent quotes, and manage connections"
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Bell}
          label="Available to Quote"
          value={availableToQuote.length}
          hint="in your service area"
          tone="brand"
        />
        <StatCard
          icon={Send}
          label="Offers Submitted"
          value={offers.length}
          hint="active quotes"
          tone="blue"
        />
        <StatCard
          icon={Link2}
          label="Connections"
          value={connections.length}
          hint="customer approved"
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Jobs Completed"
          value={connections.filter((c) => c.outcome === "COMPLETED").length}
          hint="lifetime completed"
          tone="green"
        />
      </div>

      {/* Available Requests To Quote */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#010313]">Available Service Requests</h2>
              <p className="text-[12px] text-[#6b7280]">
                Customer requests published in your district matching your capability
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[13px] text-[#9ca3af]">Loading requests...</div>
        ) : availableToQuote.length === 0 ? (
          <EmptyState
            title="No new request invitations"
            description="You will be notified here when administrators publish matching requests in your coverage area."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Request & Description
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Location (Approx)
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Category
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
                {availableToQuote.map((req) => (
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
                      <div className="text-[12px] font-semibold text-[#010313]">{req.district}</div>
                      <div className="text-[11px] text-[#6b7280]">{req.province}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[12px] font-semibold text-[#010313]">{req.category_name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-bold uppercase text-[#be123c]">
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/provider/offers/${req.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-3.5 py-1.5 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all"
                      >
                        Submit Quote
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

      {/* Recent Connections / Contacts */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[#010313]">Approved Customer Connections</h2>
              <p className="text-[12px] text-[#6b7280]">Pay connection fee or view unlocked customer contacts</p>
            </div>
          </div>
          <Link
            href="/provider/connections"
            className="text-[12px] font-semibold text-[#1a6c80] hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {connections.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#9ca3af]">
            No customer connections unlocked yet. Submit competitive quotes to be selected!
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {connections.slice(0, 3).map((conn) => (
              <div key={conn.id} className="p-5 flex items-center justify-between hover:bg-[#fafbfc] transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#010313]">
                      Connection for REQ-{conn.request.slice(0, 8)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        conn.connection_status === "ACTIVE"
                          ? "bg-[#ecfdf5] text-[#047857]"
                          : "bg-[#fef3c7] text-[#92400e]"
                      }`}
                    >
                      {conn.connection_status}
                    </span>
                  </div>
                  {conn.customer_phone ? (
                    <div className="text-[12px] text-[#1a6c80] font-semibold mt-1">
                      Phone: {conn.customer_phone}
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#6b7280] mt-1">
                      Awaiting connection fee to unlock phone & address
                    </div>
                  )}
                </div>
                <Link
                  href="/provider/connections"
                  className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1 text-[12px] font-semibold text-[#1a6c80] hover:bg-[#eefbfc]"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
