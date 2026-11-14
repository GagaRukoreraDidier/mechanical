"use client"

import useSWR from "swr"
import { PageHeading } from "@/components/layout/PageHeading"
import type { SubscriptionPlan, ProviderSubscription } from "@/types"
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react"

export default function ProviderSubscriptionsPage() {
  const { data: plansData } = useSWR<{ results: SubscriptionPlan[] }>("/subscriptions/plans/")
  const { data: mySub } = useSWR<ProviderSubscription>("/subscriptions/provider-subs/my_subscription/")

  const plans = plansData?.results || []

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeading
          icon={CreditCard}
          title="Provider Subscriptions & Allowances"
          subtitle="Choose a commercial plan with included connection allowances and reduced fee tariffs"
        />

        {/* Current Active Plan Card */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Current Plan</span>
              <h3 className="text-[18px] font-bold text-[#010313]">
                {mySub?.plan_name || "Pay-as-you-go (Free Listing)"}
              </h3>
            </div>
            <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-[#047857] uppercase">
              Active Status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl bg-[#fafbfc] border border-[#f1f5f9] p-4">
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Included Credits Remaining</span>
              <span className="text-[24px] font-bold text-[#1a6c80] tabular-nums">
                {mySub?.credits_remaining ?? 0}
              </span>
              <span className="ml-1 text-[12px] text-[#6b7280]">connections this month</span>
            </div>
            <div className="rounded-xl bg-[#fafbfc] border border-[#f1f5f9] p-4">
              <span className="block text-[11px] font-bold uppercase text-[#9ca3af]">Overage Fee Tariff</span>
              <span className="text-[20px] font-bold text-[#010313] tabular-nums">
                RWF {mySub?.plan_details?.discounted_connection_fee_rwf?.toLocaleString() || "2,500"}
              </span>
              <span className="ml-1 text-[12px] text-[#6b7280]">per additional connection</span>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-[#010313]">Available Tiered Plans</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#ececf0] bg-[#fafbfc] p-5 flex flex-col justify-between hover:border-[#23A6BD]/40 transition-all"
              >
                <div>
                  <h4 className="text-[16px] font-bold text-[#010313]">{p.name}</h4>
                  <div className="mt-2 text-[22px] font-bold text-[#010313] tabular-nums">
                    RWF {p.price_rwf.toLocaleString()}
                    <span className="text-[12px] font-normal text-[#6b7280]">/{p.billing_period.toLowerCase()}</span>
                  </div>
                  <div className="mt-2 text-[12px] font-semibold text-[#1a6c80]">
                    {p.included_connections} included unlocks / mo
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

                <div className="mt-6 pt-3 border-t border-[#ececf0]">
                  <button
                    type="button"
                    className="w-full rounded-lg border border-[#23A6BD] bg-[#23A6BD] py-2 text-[12px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all"
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
