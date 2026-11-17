"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Wrench, Car, Cog, Home, UserCheck, ArrowRight, Loader2, Phone, CreditCard, ShieldCheck } from "lucide-react"

const ROLES = [
  { id: "CUSTOMER", title: "Customer / Requester", icon: UserCheck, desc: "Request mechanical repairs, parts, or home technicians" },
  { id: "GARAGE", title: "Garage / Workshop", icon: Car, desc: "Automotive repair workshop with physical premises" },
  { id: "MECHANIC", title: "Independent Mechanic", icon: Wrench, desc: "Mobile or independent certified automotive specialist" },
  { id: "SELLER", title: "Spare Parts Seller", icon: Cog, desc: "Importer, distributor or retailer of vehicle spare parts" },
  { id: "HOME_TECH", title: "Home Technician", icon: Home, desc: "Plumbing, electrical, solar, AC or appliance specialist" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState("CUSTOMER")
  const [fullName, setFullName] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [phone, setPhone] = useState("+250")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || phone === "+250") {
      setError("Please provide a valid Rwandan telephone number.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/register/", {
        full_name: fullName,
        national_id: nationalId || undefined,
        phone,
        email: email || undefined,
        role,
        password: password || nationalId || phone || "123456",
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/login?registered=true&identifier=${encodeURIComponent(phone || nationalId)}`)
      }, 1200)
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed. Please check your details.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-2xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#23A6BD] text-[#010313] mb-3">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="text-[24px] font-bold text-[#010313]">Join MHSG Rwanda</h1>
          <p className="mt-1 text-[13px] text-[#6b7280]">
            An Initiative of <strong className="text-[#010313]">FIX-IT-FAST CO. Ltd</strong> (Owner) &amp; <strong className="text-[#010313]">GAMU</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-10 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[13px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Account created successfully! Redirecting you to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Role */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7280] mb-2">
                1. Select Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const selected = role === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selected
                          ? "border-[#23A6BD] bg-[#eefbfc] ring-2 ring-[#23A6BD]/20"
                          : "border-[#ececf0] bg-white hover:border-[#cbd5e1]"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          selected ? "bg-[#23A6BD] text-[#010313]" : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-[13px] font-bold text-[#010313]">{r.title}</span>
                        <span className="block text-[11px] text-[#6b7280] leading-snug">{r.desc}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Identification Details */}
            <div className="pt-4 border-t border-[#f1f5f9]">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7280] mb-3">
                2. User Identification &amp; Credentials
              </label>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                    Full Name or Business Workshop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mugisha Jean-Luc or Kigali Express Garage"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1 flex items-center justify-between">
                      <span>Rwandan National ID (16 Digits)</span>
                      <CreditCard className="h-3.5 w-3.5 text-[#23A6BD]" />
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="1 199X 8 00XXXXX X XX"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all font-mono"
                    />
                    <span className="block text-[10px] text-[#9ca3af] mt-0.5">
                      Can be used as your username &amp; password
                    </span>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1 flex items-center justify-between">
                      <span>Telephone Number (MTN / Airtel) *</span>
                      <Phone className="h-3.5 w-3.5 text-[#23A6BD]" />
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 123 456"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                    />
                    <span className="block text-[10px] text-[#9ca3af] mt-0.5">
                      Can be used as your username
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com (optional)"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to use National ID / Phone"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                    />
                    <span className="block text-[10px] text-[#9ca3af] mt-0.5">
                      If blank, defaults to your ID or Phone Number
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-3 text-[14px] font-bold text-[#010313] hover:border-[#1a879c] hover:bg-[#1a879c] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration &amp; Enter Portal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[12px] text-[#6b7280]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#1a6c80] hover:underline">
              Sign in with Telephone or National ID
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
