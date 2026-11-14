"use client"

import { useState } from "react"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import { EmptyState } from "@/components/ui/EmptyState"
import type { Connection } from "@/types"
import {
  Link2,
  Phone,
  MapPin,
  CheckCircle2,
  CreditCard,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react"

export default function ProviderConnectionsPage() {
  const { data: connectionsData, mutate, isLoading } = useSWR<{ results: Connection[] }>("/connections/")
  const connections = connectionsData?.results || []

  const [payingId, setPayingId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState("")

  const handlePayConnectionFee = async (connectionId: string) => {
    setPayingId(connectionId)
    try {
      // 1. Create connection fee intent
      const payRes = await api.post("/billing/payments/initiate_connection_fee/", {
        connection_id: connectionId,
      })

      // 2. Simulate sandbox payment confirmation
      await api.post(`/billing/payments/${payRes.data.id}/simulate_sandbox_pay/`)

      setSuccessMsg("Connection fee verified! Customer contact details unlocked.")
      await mutate()
    } catch (err: any) {
      alert("Payment failed: " + (err.response?.data?.detail || err.message))
    } finally {
      setPayingId(null)
    }
  }

  const handleMarkCompleted = async (connectionId: string) => {
    try {
      await api.post(`/connections/${connectionId}/report_outcome/`, {
        outcome: "COMPLETED",
        notes: "Completed service as agreed directly with customer.",
      })
      await mutate()
    } catch (err: any) {
      alert("Failed to report completion: " + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeading
          icon={Link2}
          title="Customer Connections"
          subtitle="Manage customer-approved requests and unlock authorized contact information"
        />

        {successMsg && (
          <div className="rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-4 text-[13px] font-semibold text-[#047857]">
            {successMsg}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-[13px] text-[#9ca3af]">Loading connections...</div>
        ) : connections.length === 0 ? (
          <EmptyState
            title="No active customer connections"
            description="When a customer approves your quote, the connection will appear here awaiting unlock."
          />
        ) : (
          <div className="space-y-4">
            {connections.map((conn) => {
              const isUnlocked = conn.connection_status === "ACTIVE"
              return (
                <div
                  key={conn.id}
                  className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-[#010313]">
                          Connection for REQ-{conn.request.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isUnlocked
                              ? "bg-[#ecfdf5] text-[#047857]"
                              : "bg-[#fef3c7] text-[#92400e]"
                          }`}
                        >
                          {isUnlocked ? "Details Unlocked" : "Awaiting Connection Fee"}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6b7280] mt-0.5">
                        Customer approved connection on {new Date(conn.customer_approval_at).toLocaleDateString()}
                      </p>
                    </div>

                    {!isUnlocked && (
                      <button
                        type="button"
                        onClick={() => handlePayConnectionFee(conn.id)}
                        disabled={payingId === conn.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-2 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {payingId === conn.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Pay Connection Fee (RWF 2,500)
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="mt-4">
                    {!isUnlocked ? (
                      <div className="rounded-xl bg-[#fafbfc] border border-[#f1f5f9] p-4 text-[13px] text-[#6b7280]">
                        <p className="font-semibold text-[#010313]">Privacy Protected</p>
                        <p className="mt-1 text-[12px]">
                          Customer phone number and exact address will unlock immediately upon verified connection fee payment.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {conn.customer_phone ? (
                            <div className="rounded-xl bg-[#eefbfc] border border-[#a9e9ef] p-4 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#23A6BD] text-[#010313]">
                                <Phone className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="block text-[11px] font-bold uppercase text-[#1a6c80]">
                                  Customer Phone Number
                                </span>
                                <a
                                  href={`tel:${conn.customer_phone}`}
                                  className="text-[16px] font-bold text-[#010313] hover:underline"
                                >
                                  {conn.customer_phone}
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 text-[12px] text-[#6b7280]">Customer chose in-app messaging only</div>
                          )}

                          {conn.customer_address && (
                            <div className="rounded-xl bg-[#eefbfc] border border-[#a9e9ef] p-4 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#23A6BD] text-[#010313]">
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="block text-[11px] font-bold uppercase text-[#1a6c80]">
                                  Exact Service Address
                                </span>
                                <span className="text-[13px] font-semibold text-[#010313]">
                                  {conn.customer_address.street_address}, {conn.customer_address.sector}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {conn.outcome !== "COMPLETED" ? (
                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(conn.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#047857] hover:bg-[#ecfdf5] transition-all"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark Job Completed
                            </button>
                          </div>
                        ) : (
                          <div className="text-[12px] font-bold text-[#047857] flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed Successfully
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
