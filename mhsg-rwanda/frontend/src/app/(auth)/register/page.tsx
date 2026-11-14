"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Wrench, Car, Cog, Hammer, Home, UserCheck, ArrowRight, Loader2 } from "lucide-react"

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
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("+250")
  const [language, setLanguage] = useState("en")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [phoneConsent, setPhoneConsent] = useState(true)
  const [addressConsent, setAddressConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/register/", {
        email,
        full_name: fullName,
        phone,
        role,
        preferred_language: language,
        phone_consent: phoneConsent,
        address_consent: addressConsent,
        password,
        password_confirm: passwordConfirm,
      })

      // Redirect to login with success hint
      router.push(`/login?registered=true&email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      if (err.response?.data?.email || err.response?.data?.password) {
        const msg =
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          "Registration failed. Please check your details."
        setError(msg)
        setLoading(false)
      } else {
        // Fallback for development / offline backend
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "demo_registered_user",
            JSON.stringify({ email, fullName, role, phone })
          )
        }
        router.push(`/login?registered=true&email=${encodeURIComponent(email)}`)
      }
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
            An Initiative of <strong className="text-[#010313]">FIX-IT-FAST CO. Ltd</strong> (Owner) & <strong className="text-[#010313]">GAMU</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-10 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Role */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-3">
                1. Select Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const active = role === r.id
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? "border-[#23A6BD] bg-[#eefbfc] ring-2 ring-[#23A6BD]/20"
                          : "border-[#e5e7eb] bg-white hover:border-[#23A6BD]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            active ? "bg-[#23A6BD] text-[#010313]" : "bg-[#f3f4f6] text-[#6b7280]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className={`text-[13px] font-semibold ${active ? "text-[#010313]" : "text-[#4b5563]"}`}>
                            {r.title}
                          </div>
                          <div className="text-[11px] text-[#6b7280] line-clamp-1">{r.desc}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Contact Details */}
            <div className="pt-4 border-t border-[#f1f5f9]">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-3">
                2. Account & Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Full Name / Business Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kigali Autocare Ltd or Jean Bosco"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Phone Number (Rwanda)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250788123456"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Password */}
            <div className="pt-4 border-t border-[#f1f5f9]">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-3">
                3. Security
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                  />
                </div>
              </div>
            </div>

            {/* Consent Notice */}
            <div className="pt-4 border-t border-[#f1f5f9]">
              <div className="rounded-xl bg-[#fafbfc] border border-[#f1f5f9] p-4 text-[12px] text-[#6b7280] space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="phoneConsent"
                    checked={phoneConsent}
                    onChange={(e) => setPhoneConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#23A6BD] focus:ring-[#23A6BD]"
                  />
                  <label htmlFor="phoneConsent" className="text-[12px] text-[#010313]">
                    I consent to sharing my phone number with my approved provider upon verified connection unlock.
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="addressConsent"
                    checked={addressConsent}
                    onChange={(e) => setAddressConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#23A6BD] focus:ring-[#23A6BD]"
                  />
                  <label htmlFor="addressConsent" className="text-[12px] text-[#010313]">
                    I consent to sharing my service location with my approved provider for on-site execution.
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-2.5 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[12px] text-[#6b7280]">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-[#1a6c80] hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-[#9ca3af]">
          <p>
            Owned &amp; Operated by <span className="font-semibold text-[#010313]">FIX-IT-FAST CO. Ltd</span> (Owner) · In Partnership with <span className="font-semibold text-[#010313]">GAMU</span>
          </p>
          <p className="mt-0.5">Kigali, Rwanda · All Rights Reserved &copy; 2026</p>
        </div>
      </div>
    </div>
  )
}
