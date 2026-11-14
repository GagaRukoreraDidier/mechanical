"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ProviderOffer } from "@/types"
import { Star, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react"

export default function ProviderOffersPage() {
  const { data: offersData, isLoading } = useSWR<{ results: ProviderOffer[] }>("/offers/")
  const offers = offersData?.results || []

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeading
          icon={Star}
          title="My Submitted Offers"
          subtitle="View and track your submitted quotations across customer requests"
        />

        <div className="rounded-2xl border border-[#ececf0] bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-[13px] text-[#9ca3af]">Loading your offers...</div>
          ) : offers.length === 0 ? (
            <EmptyState
              title="No offers submitted yet"
              description="Browse the provider dashboard to discover active customer requests and submit quotes."
              actionLabel="Go to Dashboard"
              onAction={() => window.location.assign("/provider/dashboard")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      Request Reference
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      Quoted Price (RWF)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      Lead Time
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      Submitted Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-[#fafbfc] transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-[12px] font-bold uppercase text-[#7c3aed]">
                          REQ-{offer.request.slice(0, 8)}
                        </span>
                        <div className="text-[12px] text-[#4b5563] line-clamp-1 mt-0.5">
                          {offer.scope}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#010313] tabular-nums">
                        {offer.price_min_rwf ? `RWF ${offer.price_min_rwf.toLocaleString()}` : "Inspection required"}
                        {offer.price_max_rwf && ` - RWF ${offer.price_max_rwf.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-4 text-[12px] text-[#6b7280]">
                        {offer.estimated_lead_time}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            offer.status === "SELECTED"
                              ? "bg-[#ecfdf5] text-[#047857]"
                              : "bg-[#f3f4f6] text-[#4b5563]"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[12px] text-[#6b7280]">
                        {new Date(offer.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
