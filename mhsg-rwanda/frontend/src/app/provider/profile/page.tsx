"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import type { ProviderProfile } from "@/types"
import {
  User,
  ShieldCheck,
  MapPin,
  Wrench,
  Check,
  Loader2,
  FileText,
} from "lucide-react"

export default function ProviderProfilePage() {
  const { data: profile, mutate, isLoading } = useSWR<ProviderProfile>("/providers/me/")

  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "")
      setDescription(profile.description || "")
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSavedMsg("")
    try {
      await api.patch(`/providers/${profile.id}/`, {
        display_name: displayName,
        description,
      })
      setSavedMsg("Profile updated successfully!")
      await mutate()
    } catch (err: any) {
      alert("Failed to save profile: " + (err.response?.data?.detail || err.message))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-8 flex items-center justify-center text-[13px] text-[#9ca3af]">
        <Loader2 className="h-5 w-5 animate-spin text-[#23A6BD] mr-2" />
        Loading profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeading
          icon={User}
          title="Provider Profile & Verification"
          subtitle="Manage your business information, service location radius, and documentary verification"
        />

        {savedMsg && (
          <div className="rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] p-4 text-[13px] font-semibold text-[#047857]">
            {savedMsg}
          </div>
        )}

        {/* Verification Status Banner */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eefbfc] text-[#1a6c80]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[#010313]">Verification Status</span>
                <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#047857]">
                  {profile?.verification_status?.replace("_", " ") || "UNVERIFIED"}
                </span>
              </div>
              <p className="text-[12px] text-[#6b7280] mt-0.5">
                Verified providers receive priority placement in algorithmic matching recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-[15px] font-bold text-[#010313] border-b border-[#f1f5f9] pb-3 mb-6">
            Business Details
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                Display / Workshop Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                Business Description & Experience
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your garage equipment, mechanic specialties, brand expertise, and opening hours..."
                className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-5 py-2 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
