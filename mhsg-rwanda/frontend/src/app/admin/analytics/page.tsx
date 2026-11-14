"use client"

import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatCard } from "@/components/ui/StatCard"
import type { AnalyticsMetrics } from "@/types"
import {
  BarChart3,
  TrendingUp,
  Coins,
  MapPin,
  ClipboardList,
  Link2,
} from "lucide-react"

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useSWR<{
    metrics: AnalyticsMetrics
    status_breakdown: { status: string; count: number }[]
    revenue_by_purpose: { purpose: string; total: number; count: number }[]
    top_districts: { district: string; count: number }[]
  }>("/admin-panel/analytics/")

  const metrics = analytics?.metrics
  const statusList = analytics?.status_breakdown || []
  const revenueList = analytics?.revenue_by_purpose || []
  const districts = analytics?.top_districts || []

  const maxStatusCount = Math.max(...statusList.map((s) => s.count), 1)

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeading
          icon={BarChart3}
          title="Marketplace Analytics & Reports"
          subtitle="Operational funnel, revenue separation, district demand and provider conversion metrics"
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ClipboardList}
            label="Total Requests"
            value={metrics?.total_requests || 0}
            hint="all categories"
            tone="brand"
          />
          <StatCard
            icon={Link2}
            label="Unlocked Connections"
            value={metrics?.unlocked_connections || 0}
            hint="paid connections"
            tone="blue"
          />
          <StatCard
            icon={Coins}
            label="Total Platform Revenue"
            value={`RWF ${(metrics?.total_revenue_rwf || 0).toLocaleString()}`}
            hint="fees collected"
            tone="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Providers"
            value={metrics?.active_providers || 0}
            hint="verified workshops"
            tone="amber"
          />
        </div>

        {/* Request Pipeline / Status Funnel */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-[#010313] border-b border-[#f1f5f9] pb-3">
            Request Workflow Funnel
          </h3>
          <p className="text-[12px] text-[#6b7280]">
            Volume of requests currently traversing each state of the marketplace coordination engine.
          </p>

          <div className="space-y-3 pt-2">
            {statusList.length === 0 ? (
              <div className="text-[13px] text-[#9ca3af] text-center p-4">No request records yet.</div>
            ) : (
              statusList.map((item) => {
                const pct = Math.round((item.count / maxStatusCount) * 100)
                return (
                  <div key={item.status} className="grid grid-cols-1 md:grid-cols-[14rem_1fr_4rem] items-center gap-3">
                    <span className="text-[12px] font-semibold text-[#010313] truncate">
                      {item.status.replace(/_/g, " ")}
                    </span>
                    <div className="h-3 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#23A6BD] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-right text-[13px] font-bold text-[#010313] tabular-nums">
                      {item.count}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Revenue Separation & District Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#010313] border-b border-[#f1f5f9] pb-3">
              Revenue by Fee Category
            </h3>
            <p className="text-[12px] text-[#6b7280]">
              MHSG platform fees separate from customer-provider direct payments.
            </p>

            <div className="divide-y divide-[#f1f5f9]">
              {revenueList.length === 0 ? (
                <div className="text-[13px] text-[#9ca3af] text-center p-4">No fees collected yet.</div>
              ) : (
                revenueList.map((rev) => (
                  <div key={rev.purpose} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-[#010313]">
                        {rev.purpose.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-[#6b7280]">{rev.count} transactions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-[#047857] tabular-nums">
                        RWF {rev.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* District Demand */}
          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#010313] border-b border-[#f1f5f9] pb-3">
              Demand by Rwandan District
            </h3>
            <p className="text-[12px] text-[#6b7280]">Geographic concentration of incoming service requests.</p>

            <div className="divide-y divide-[#f1f5f9]">
              {districts.length === 0 ? (
                <div className="text-[13px] text-[#9ca3af] text-center p-4">No district data available.</div>
              ) : (
                districts.map((d) => (
                  <div key={d.district} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#23A6BD]" />
                      <span className="text-[13px] font-semibold text-[#010313]">{d.district}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#010313] tabular-nums bg-[#fafbfc] px-2.5 py-0.5 rounded-lg border border-[#ececf0]">
                      {d.count} requests
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
