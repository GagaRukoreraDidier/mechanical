"use client"

import { useState } from "react"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import type { SubscriptionPlan } from "@/types"
import {
  Settings,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"

export default function AdminConfigPage() {
  const { data: plansData, mutate: mutatePlans } = useSWR<{ results: SubscriptionPlan[] }>("/subscriptions/plans/")
  const { data: feeConfigsData, mutate: mutateFees } = useSWR<{ results: any[] }>("/billing/fee-configs/")

  const plans = plansData?.results || []
  const feeConfigs = feeConfigsData?.results || []

  const [feeType, setFeeType] = useState("REQUEST_FEE")
  const [feeAmount, setFeeAmount] = useState("1000")
  const [notes, setNotes] = useState("Updated via admin control panel")
  const [savingFee, setSavingFee] = useState(false)
  const [feeMsg, setFeeMsg] = useState("")

  const handleAddFeeConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingFee(true)
    setFeeMsg("")
    try {
      await api.post("/billing/fee-configs/", {
        fee_type: feeType,
        amount_rwf: parseInt(feeAmount),
        currency: "RWF",
        effective_from: new Date().toISOString().split("T")[0],
        is_active: true,
        notes,
      })
      setFeeMsg("Fee configuration updated successfully!")
      await mutateFees()
    } catch (err: any) {
      alert("Failed to save fee: " + (err.response?.data?.detail || err.message))
    } finally {
      setSavingFee(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeading
          icon={Settings}
          title="Marketplace Configuration & Pricing"
          subtitle="Configure request activation fees, provider connection tariffs, and subscription allowances"
        />

        {/* 1. Fee Configurations Table & Form */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div>
              <h3 className="text-[15px] font-bold text-[#010313]">Active Fee Configurations</h3>
              <p className="text-[12px] text-[#6b7280]">
                All fees are stored in integer RWF and take effect immediately without code modification
              </p>
            </div>
          </div>

          {feeMsg && (
            <div className="rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-3 text-[12px] font-semibold text-[#047857]">
              {feeMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAddFeeConfig} className="p-4 rounded-xl bg-[#fafbfc] border border-[#ececf0] space-y-4">
            <h4 className="text-[13px] font-bold text-[#010313]">Set or Update Fee Tariff</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Fee Type</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#010313]"
                >
                  <option value="REQUEST_FEE">Customer Request Activation Fee</option>
                  <option value="CONNECTION_FEE">Provider Connection Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Amount (RWF)</label>
                <input
                  type="number"
                  required
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Tariff Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingFee}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-2 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm"
              >
                {savingFee ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save Fee Configuration
              </button>
            </div>
          </form>

          {/* List of active fee rules */}
          <div className="divide-y divide-[#f1f5f9]">
            {feeConfigs.map((f: any) => (
              <div key={f.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-[#010313]">
                    {f.fee_type === "REQUEST_FEE" ? "Customer Request Activation" : "Provider Connection Fee"}
                  </span>
                  <div className="text-[11px] text-[#6b7280]">
                    Effective from: {f.effective_from} — {f.notes}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold text-[#010313] tabular-nums">
                    RWF {f.amount_rwf.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-[#047857] uppercase bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Provider Subscription Plans */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div>
              <h3 className="text-[15px] font-bold text-[#010313]">Provider Subscription Plans</h3>
              <p className="text-[12px] text-[#6b7280]">
                Tiered commercial plans with included connection allowances and reduced per-connection pricing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#ececf0] bg-[#fafbfc] p-5 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-[15px] font-bold text-[#010313]">{p.name}</h4>
                  <div className="mt-2 text-[22px] font-bold text-[#010313] tabular-nums">
                    RWF {p.price_rwf.toLocaleString()}
                    <span className="text-[12px] font-normal text-[#6b7280]">/{p.billing_period.toLowerCase()}</span>
                  </div>
                  <div className="mt-3 text-[12px] text-[#1a6c80] font-semibold">
                    {p.included_connections} Included Connections / mo
                  </div>
                  <div className="text-[11px] text-[#6b7280]">
                    Discounted Overage: RWF {p.discounted_connection_fee_rwf.toLocaleString()}
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-[#f1f5f9] pt-3 text-[11px] text-[#4b5563]">
                    {p.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#23A6BD] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-[#ececf0] text-[11px] font-bold text-[#047857]">
                  Active Plan
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
