"use client"

import { useState } from "react"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import { SearchInput } from "@/components/ui/SearchInput"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ProviderProfile } from "@/types"
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Star,
  Check,
  Ban,
  Loader2,
} from "lucide-react"

export default function AdminProvidersPage() {
  const [tab, setTab] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  const { data: providersData, mutate, isLoading } = useSWR<{ results: ProviderProfile[] }>("/providers/")
  const providers = providersData?.results || []

  const handleVerify = async (providerId: string, statusVal: string) => {
    try {
      await api.post(`/providers/${providerId}/verify/`, {
        verification_status: statusVal,
      })
      await mutate()
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.detail || err.message))
    }
  }

  const handleToggleSuspend = async (providerId: string, currentSuspended: boolean) => {
    try {
      await api.post(`/providers/${providerId}/suspend/`, {
        is_suspended: !currentSuspended,
        reason: !currentSuspended ? "Administrative review hold" : "",
      })
      await mutate()
    } catch (err: any) {
      alert("Failed to update suspension: " + (err.response?.data?.detail || err.message))
    }
  }

  const filtered = providers.filter((p) => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.display_name.toLowerCase().includes(q) && !p.user_email?.toLowerCase().includes(q)) {
        return false
      }
    }
    if (tab === "UNVERIFIED") return p.verification_status === "UNVERIFIED"
    if (tab === "VERIFIED") return p.verification_status !== "UNVERIFIED"
    if (tab === "SUSPENDED") return p.is_suspended
    return true
  })

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeading
        icon={Users}
        title="Providers & Verification"
        subtitle="Review garage and technician credentials, verify RDB registration and national IDs"
      />

      <div className="rounded-2xl border border-[#ececf0] bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#e6e8ec] px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Providers", count: providers.length },
              { id: "UNVERIFIED", label: "Unverified", count: providers.filter((p) => p.verification_status === "UNVERIFIED").length },
              { id: "VERIFIED", label: "Verified & Certified", count: providers.filter((p) => p.verification_status !== "UNVERIFIED").length },
              { id: "SUSPENDED", label: "Suspended", count: providers.filter((p) => p.is_suspended).length },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  tab === t.id
                    ? "bg-[#23A6BD] text-[#010313]"
                    : "text-[#4b5563] hover:bg-[#f3f4f6]"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tab === t.id ? "bg-white/30 text-[#010313]" : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <SearchInput
            value={search}
            onChange={(val: any) => setSearch(typeof val === 'string' ? val : val.target.value)}
            placeholder="Search provider name or email..."
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center text-[13px] text-[#9ca3af]">Loading provider directory...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching providers found"
            description="Adjust your search criteria or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Provider & Contact
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Types & Location
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Verification Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Rating
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Verification Controls
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="text-[14px] font-bold text-[#010313]">{p.display_name}</div>
                        <div className="text-[12px] text-[#6b7280]">{p.user_email}</div>
                        {p.is_suspended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <Ban className="h-3 w-3" />
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.provider_types?.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#4b5563]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-[#6b7280] mt-1">
                        {p.locations?.[0]?.district || "Rwanda"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          p.verification_status === "CERTIFIED"
                            ? "bg-[#23A6BD] text-[#010313]"
                            : p.verification_status !== "UNVERIFIED"
                            ? "bg-[#ecfdf5] text-[#047857]"
                            : "bg-[#f3f4f6] text-[#6b7280]"
                        }`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {p.verification_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-[12px] font-semibold text-[#010313]">
                        <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                        {p.rating_average || 0} ({p.rating_count || 0})
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={p.verification_status}
                          onChange={(e) => handleVerify(p.id, e.target.value)}
                          className="rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#010313] focus:border-[#23A6BD] focus:outline-none"
                        >
                          <option value="UNVERIFIED">Unverified</option>
                          <option value="IDENTITY_CHECKED">ID Checked</option>
                          <option value="BUSINESS_CHECKED">Business Checked</option>
                          <option value="DOCS_REVIEWED">Docs Reviewed</option>
                          <option value="CERTIFIED">Certified</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(p.id, p.is_suspended)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                            p.is_suspended
                              ? "border-[#e5e7eb] text-[#047857] hover:bg-[#ecfdf5]"
                              : "border-rose-200 text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          {p.is_suspended ? "Reinstate" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
