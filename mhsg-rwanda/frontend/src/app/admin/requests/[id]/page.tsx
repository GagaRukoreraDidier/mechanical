"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { ServiceRequest, ProviderOffer } from "@/types"
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Link2,
  Award,
  Sparkles,
  Loader2,
  ShieldCheck,
  Star,
  Check,
} from "lucide-react"

export default function AdminRequestDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: request, mutate: mutateRequest, isLoading } = useSWR<ServiceRequest>(`/requests/${id}/`)
  const { data: offersData, mutate: mutateOffers } = useSWR<{ results: ProviderOffer[] }>(
    request ? `/offers/?request=${id}` : null
  )
  const { data: matchingData } = useSWR<{ ranked_providers: any[] }>(
    request ? `/matching/${id}/` : null
  )

  const offers = offersData?.results || []
  const rankedProviders = matchingData?.ranked_providers || []

  const [acting, setActing] = useState(false)
  const [rationale, setRationale] = useState("Highest technical capability match and located within the requested district.")
  const [successMsg, setSuccessMsg] = useState("")

  const handleReviewAction = async (decision: string) => {
    setActing(true)
    try {
      await api.post(`/requests/${id}/admin_review/`, {
        decision,
        reason: `Admin updated status via control panel: ${decision}`,
      })
      setSuccessMsg(`Request successfully transitioned: ${decision}`)
      await mutateRequest()
    } catch (err: any) {
      alert("Action failed: " + (err.response?.data?.detail || err.message))
    } finally {
      setActing(false)
    }
  }

  const handlePublish = async () => {
    setActing(true)
    try {
      await api.post(`/requests/${id}/publish/`, {
        expiry_hours: 48,
      })
      setSuccessMsg("Request published to eligible providers in the district!")
      await mutateRequest()
    } catch (err: any) {
      alert("Publish failed: " + (err.response?.data?.detail || err.message))
    } finally {
      setActing(false)
    }
  }

  const handleSelectOffer = async (offerId: string) => {
    setActing(true)
    try {
      await api.post("/offers/select_offer/", {
        offer_id: offerId,
        rationale,
      })
      setSuccessMsg("Provider selected and recommendation sent to customer!")
      await mutateRequest()
      await mutateOffers()
    } catch (err: any) {
      alert("Selection failed: " + (err.response?.data?.detail || err.message))
    } finally {
      setActing(false)
    }
  }

  if (isLoading || !request) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-8 flex items-center justify-center text-[13px] text-[#9ca3af]">
        <Loader2 className="h-5 w-5 animate-spin text-[#23A6BD] mr-2" />
        Loading request details...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1a6c80] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Moderation Queue
        </Link>

        {/* Heading & Moderation Actions */}
        <PageHeading
          icon={ClipboardList}
          title={`Moderate REQ-${request.id.slice(0, 8).toUpperCase()}`}
          subtitle={`Submitted by ${request.customer_name || "Customer"} in ${request.district}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={request.status} />

              {request.status === "SUBMITTED" && (
                <button
                  type="button"
                  onClick={() => handleReviewAction("start_review")}
                  disabled={acting}
                  className="rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-3.5 py-1.5 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c]"
                >
                  Start Review
                </button>
              )}

              {request.status === "UNDER_REVIEW" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReviewAction("needs_info")}
                    disabled={acting}
                    className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
                  >
                    Request Info
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewAction("reject")}
                    disabled={acting}
                    className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={acting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-1.5 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Publish to Providers
                  </button>
                </>
              )}
            </div>
          }
        />

        {successMsg && (
          <div className="rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-4 text-[13px] font-semibold text-[#047857]">
            {successMsg}
          </div>
        )}

        {/* 1. Request Details Card */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-[#010313] border-b border-[#f1f5f9] pb-3">
            Customer Specifications & Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Category</span>
              <span className="font-semibold text-[#010313]">{request.category_name}</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Location</span>
              <span className="font-semibold text-[#010313]">{request.district}, {request.province}</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Urgency</span>
              <span className="font-semibold text-[#be123c]">{request.urgency}</span>
            </div>

            {request.vehicle_make && (
              <div className="sm:col-span-3 pt-2 border-t border-[#f1f5f9]">
                <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Vehicle Details</span>
                <span className="font-semibold text-[#010313]">
                  {request.vehicle_make} {request.vehicle_model} {request.vehicle_year && `(${request.vehicle_year})`} — {request.mileage || "N/A"}
                </span>
              </div>
            )}

            {request.part_name && (
              <div className="sm:col-span-3 pt-2 border-t border-[#f1f5f9]">
                <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Spare Part Details</span>
                <span className="font-semibold text-[#010313]">
                  {request.part_name} (Qty: {request.quantity || 1}) — Part #: {request.part_number || "Not specified"} — Condition: {request.condition_preference || "Any"}
                </span>
              </div>
            )}

            <div className="sm:col-span-3 pt-2 border-t border-[#f1f5f9]">
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Customer Problem Description</span>
              <p className="mt-1 text-[#4b5563] leading-relaxed">{request.description}</p>
            </div>
          </div>
        </div>

        {/* 2. Matching Engine Ranked Recommendations */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#23A6BD]" />
              <h3 className="text-[15px] font-bold text-[#010313]">
                Algorithmic Provider Matching Recommendations
              </h3>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a6c80] bg-[#eefbfc] px-2.5 py-0.5 rounded-full">
              Decision Support Engine
            </span>
          </div>

          <p className="text-[12px] text-[#6b7280]">
            Weighted formula: Capability (25%) + Distance (20%) + Availability (15%) + Verification (15%) + Price (10%) + Rating (10%) + Reliability (5%).
          </p>

          {rankedProviders.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-[#9ca3af]">
              No active providers matching criteria in this district yet.
            </div>
          ) : (
            <div className="space-y-3">
              {rankedProviders.slice(0, 5).map((p, idx) => (
                <div
                  key={p.provider_id}
                  className="rounded-xl border border-[#ececf0] bg-[#fafbfc] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#23A6BD] text-[11px] font-bold text-[#010313]">
                        #{idx + 1}
                      </span>
                      <span className="text-[14px] font-bold text-[#010313]">{p.display_name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" />
                        {p.verification_status}
                      </span>
                      {p.rating_average > 0 && (
                        <span className="text-[11px] font-semibold text-[#92400e] flex items-center gap-0.5">
                          <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                          {p.rating_average} ({p.rating_count})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.reasons?.map((reason: string, rIdx: number) => (
                        <span
                          key={rIdx}
                          className="rounded-md bg-white border border-[#e5e7eb] px-2 py-0.5 text-[11px] text-[#4b5563]"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[18px] font-bold text-[#1a6c80] tabular-nums">
                        {p.total_score}
                        <span className="text-[12px] text-[#9ca3af]">/100</span>
                      </div>
                      <div className="text-[10px] font-semibold text-[#6b7280]">Overall Match Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Submitted Provider Offers & Admin Selection */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <h3 className="text-[15px] font-bold text-[#010313]">
              Provider Offers & Quotations ({offers.length})
            </h3>
          </div>

          {offers.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#9ca3af]">
              No provider quotations received yet for this request.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-1">
                  Recommendation Rationale (Sent to Customer)
                </label>
                <input
                  type="text"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313]"
                />
              </div>

              <div className="divide-y divide-[#f1f5f9]">
                {offers.map((offer) => (
                  <div key={offer.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#010313]">{offer.provider_name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            offer.status === "SELECTED"
                              ? "bg-[#ecfdf5] text-[#047857]"
                              : "bg-[#f3f4f6] text-[#4b5563]"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6b7280] mt-1">
                        Quoted: <span className="font-bold text-[#010313] tabular-nums">
                          {offer.price_min_rwf ? `RWF ${offer.price_min_rwf.toLocaleString()}` : "Inspection required"}
                          {offer.price_max_rwf && ` - RWF ${offer.price_max_rwf.toLocaleString()}`}
                        </span>{" "}
                        — Lead Time: <span className="font-semibold text-[#010313]">{offer.estimated_lead_time}</span>
                      </div>
                      <div className="text-[12px] text-[#4b5563] mt-2 bg-[#fafbfc] p-3 rounded-lg border border-[#f1f5f9]">
                        <span className="font-semibold text-[#010313]">Scope: </span>
                        {offer.scope}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {offer.status !== "SELECTED" ? (
                        <button
                          type="button"
                          onClick={() => handleSelectOffer(offer.id)}
                          disabled={acting}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-2 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm"
                        >
                          <Check className="h-4 w-4" />
                          Select & Recommend
                        </button>
                      ) : (
                        <span className="text-[12px] font-bold text-[#047857] flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Recommended to Customer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
