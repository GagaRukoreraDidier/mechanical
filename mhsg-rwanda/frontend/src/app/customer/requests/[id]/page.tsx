"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { ServiceRequest, ProviderOffer, Connection } from "@/types"
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Check,
  Loader2,
} from "lucide-react"

export default function CustomerRequestDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [approving, setApproving] = useState(false)
  const [actionMsg, setActionMsg] = useState("")

  const { data: request, mutate: mutateRequest, isLoading } = useSWR<ServiceRequest>(`/requests/${id}/`)
  const { data: offersData, mutate: mutateOffers } = useSWR<{ results: ProviderOffer[] }>(
    request ? `/offers/?request=${id}` : null
  )
  const { data: connectionData } = useSWR<Connection>(
    request && ["CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED", "COMPLETED"].includes(request.status)
      ? `/connections/?request=${id}`
      : null
  )

  const offers = offersData?.results || []

  const handleCustomerApproval = async (approved: boolean) => {
    setApproving(true)
    try {
      await api.post(`/requests/${id}/customer_approval/`, {
        approved,
        reason: approved ? "Approved by customer" : "Customer requested other offers",
      })
      setActionMsg(approved ? "Provider approved! Connection payment pending." : "Provider declined.")
      await mutateRequest()
      await mutateOffers()
    } catch (err: any) {
      alert("Failed to process approval: " + (err.response?.data?.detail || err.message))
    } finally {
      setApproving(false)
    }
  }

  if (isLoading || !request) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-8 flex items-center justify-center text-[13px] text-[#9ca3af]">
        <Loader2 className="h-6 w-6 animate-spin text-[#23A6BD] mr-2" />
        Loading request details...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1a6c80] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Requests
        </Link>

        {/* Page Heading */}
        <PageHeading
          icon={FileText}
          title={`Request REQ-${request.id.slice(0, 8).toUpperCase()}`}
          subtitle={`Submitted ${new Date(request.created_at).toLocaleString()}`}
          actions={<StatusBadge status={request.status} />}
        />

        {actionMsg && (
          <div className="rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-4 text-[13px] font-semibold text-[#047857]">
            {actionMsg}
          </div>
        )}

        {/* 1. Unlocked Connection Card (If active & unlocked) */}
        {["CONNECTION_UNLOCKED", "CONNECTED", "IN_PROGRESS_OR_ARRANGED", "COMPLETED"].includes(request.status) && (
          <div className="rounded-2xl border border-[#23A6BD]/40 bg-[#eefbfc] p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23A6BD] text-[#010313]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-[#010313]">Connected Provider Contact Details</h3>
                <p className="text-[12px] text-[#1a6c80]">
                  Connection fee verified. Authorized contact details unlocked for direct execution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-white rounded-xl p-4 border border-[#ececf0]">
              {request.customer_phone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-[#9ca3af]">Your Authorized Phone</div>
                    <div className="text-[14px] font-bold text-[#010313]">{request.customer_phone}</div>
                  </div>
                </div>
              )}

              {request.customer_address && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-[#9ca3af]">Service Location</div>
                    <div className="text-[13px] font-semibold text-[#010313]">
                      {request.customer_address.street_address}, {request.customer_address.sector}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Offers / Recommendation Card */}
        {["AWAITING_CUSTOMER_APPROVAL", "CUSTOMER_APPROVED", "AWAITING_CONNECTION_PAYMENT"].includes(request.status) && (
          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#f1f5f9] pb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#010313]">Administrator Recommended Provider</h3>
                <p className="text-[12px] text-[#6b7280]">
                  MHSG compared provider capabilities, pricing, and distance. Please review and approve.
                </p>
              </div>
            </div>

            {offers.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#9ca3af]">
                Offers are being compiled by the administrator...
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-5 rounded-xl border border-[#ececf0] bg-[#fafbfc] hover:border-[#23A6BD]/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-[#010313]">{offer.provider_name}</span>
                          {offer.provider_verification && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                              <ShieldCheck className="h-3 w-3" />
                              {offer.provider_verification}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[#6b7280] mt-1">
                          Estimated Time: <span className="font-semibold text-[#010313]">{offer.estimated_lead_time}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[18px] font-bold text-[#010313] tabular-nums">
                          {offer.price_min_rwf
                            ? `RWF ${offer.price_min_rwf.toLocaleString()}`
                            : "Quote upon inspection"}
                          {offer.price_max_rwf && ` - RWF ${offer.price_max_rwf.toLocaleString()}`}
                        </div>
                        <div className="text-[11px] text-[#6b7280]">Direct payment to provider</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e5e7eb] text-[13px] text-[#4b5563]">
                      <span className="font-semibold text-[#010313]">Work Scope / Offer: </span>
                      {offer.scope}
                    </div>

                    {offer.warranty_terms && (
                      <div className="mt-2 text-[12px] text-[#6b7280]">
                        <span className="font-semibold text-[#010313]">Warranty: </span>
                        {offer.warranty_terms}
                      </div>
                    )}

                    {request.status === "AWAITING_CUSTOMER_APPROVAL" && (
                      <div className="mt-4 pt-3 border-t border-[#e5e7eb] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleCustomerApproval(false)}
                          disabled={approving}
                          className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-[12px] font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Request Another Option
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomerApproval(true)}
                          disabled={approving}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-5 py-2 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] shadow-sm"
                        >
                          {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approve Recommended Connection
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Request Technical Overview */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-[#010313] border-b border-[#f1f5f9] pb-3">
            Request Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Category</span>
              <span className="font-semibold text-[#010313]">{request.category_name}</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Urgency</span>
              <span className="font-semibold text-[#010313]">{request.urgency}</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Approximate Location</span>
              <span className="font-semibold text-[#010313]">
                {request.district}, {request.province}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Activation Fee Status</span>
              <span className="font-semibold text-[#047857]">{request.fee_status}</span>
            </div>

            {request.vehicle_make && (
              <div className="sm:col-span-2 pt-2 border-t border-[#f1f5f9]">
                <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Vehicle Details</span>
                <span className="font-semibold text-[#010313]">
                  {request.vehicle_make} {request.vehicle_model} {request.vehicle_year && `(${request.vehicle_year})`}{" "}
                  {request.mileage && `— ${request.mileage}`}
                </span>
              </div>
            )}

            {request.part_name && (
              <div className="sm:col-span-2 pt-2 border-t border-[#f1f5f9]">
                <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Spare Part Details</span>
                <span className="font-semibold text-[#010313]">
                  {request.part_name} (Qty: {request.quantity || 1}) — Condition: {request.condition_preference || "Any"}
                </span>
              </div>
            )}

            <div className="sm:col-span-2 pt-2 border-t border-[#f1f5f9]">
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Description / Symptoms</span>
              <p className="mt-1 text-[#4b5563] leading-relaxed">{request.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
