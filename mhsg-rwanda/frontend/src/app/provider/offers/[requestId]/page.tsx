"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import type { ServiceRequest } from "@/types"
import {
  FileText,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react"

export default function SubmitQuotePage() {
  const { requestId } = useParams()
  const router = useRouter()

  const { data: request, isLoading } = useSWR<ServiceRequest>(`/requests/${requestId}/`)

  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [scope, setScope] = useState("")
  const [leadTime, setLeadTime] = useState("Same day (within 4 hours)")
  const [availability, setAvailability] = useState("Available immediately")
  const [warranty, setWarranty] = useState("1 month workmanship warranty")
  const [limitations, setLimitations] = useState("")
  const [genuineConfirmed, setGenuineConfirmed] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await api.post("/offers/", {
        request: requestId,
        price_min_rwf: priceMin ? parseInt(priceMin) : null,
        price_max_rwf: priceMax ? parseInt(priceMax) : null,
        scope,
        estimated_lead_time: leadTime,
        availability,
        warranty_terms: warranty,
        limitations,
        is_genuine_confirmed: genuineConfirmed,
      })

      router.push("/provider/offers?submitted=true")
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.detail ||
        "Failed to submit quote. Please ensure you are invited to quote for this request."
      )
      setLoading(false)
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
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1a6c80] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <PageHeading
          icon={Send}
          title={`Submit Offer — REQ-${request.id.slice(0, 8).toUpperCase()}`}
          subtitle="Provide a transparent quote, availability and warranty terms"
        />

        {/* Request Overview Summary */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#7c3aed]">
                REQ-{request.id.slice(0, 8)}
              </span>
              <h3 className="text-[14px] font-bold text-[#010313] mt-0.5">{request.category_name}</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-[#9ca3af]">Approximate Area</span>
              <div className="text-[13px] font-semibold text-[#010313]">
                {request.district}, {request.province}
              </div>
            </div>
          </div>

          <div className="text-[13px] text-[#4b5563]">
            <span className="font-semibold text-[#010313]">Description: </span>
            {request.description}
          </div>

          {request.vehicle_make && (
            <div className="text-[12px] text-[#6b7280]">
              Vehicle: <span className="font-semibold text-[#010313]">{request.vehicle_make} {request.vehicle_model} ({request.vehicle_year || "N/A"})</span>
            </div>
          )}

          {request.part_name && (
            <div className="text-[12px] text-[#6b7280]">
              Part Requested: <span className="font-semibold text-[#010313]">{request.part_name}</span> (Qty: {request.quantity || 1})
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Quote Form */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                  Estimated Min Price (RWF)
                </label>
                <input
                  type="number"
                  required
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                  Estimated Max Price (RWF)
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="e.g. 35000 (optional)"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-1">
                Detailed Scope of Work or Item Breakdown *
              </label>
              <textarea
                rows={4}
                required
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Itemize the labour, parts replaced, diagnostic procedures, or testing included in this quote..."
                className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                  Estimated Completion / Delivery Time
                </label>
                <input
                  type="text"
                  required
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder="e.g. 2-3 hours / Next business day"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                  Provider Availability
                </label>
                <input
                  type="text"
                  required
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Today from 2:00 PM"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                Warranty or Return Terms
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="e.g. 3 months / 5,000 km warranty on parts & labour"
                className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313]"
              />
            </div>

            <div className="rounded-xl bg-[#fafbfc] border border-[#f1f5f9] p-4 text-[12px] text-[#4b5563]">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  checked={genuineConfirmed}
                  onChange={(e) => setGenuineConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-[#23A6BD] focus:ring-[#23A6BD]"
                />
                <span>
                  I confirm that this quotation is genuine, current, and based on realistic inspection or item specifications.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-6 py-2.5 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Offer...
                  </>
                ) : (
                  <>
                    Submit Offer
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
