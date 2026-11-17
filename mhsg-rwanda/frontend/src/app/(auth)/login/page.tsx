"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Wrench, CheckCircle, ArrowRight, Loader2, KeyRound, Phone, CreditCard, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: identifier, // passed as email/identifier to NextAuth
        identifier,
        password,
      })

      if (res?.error) {
        setError("Invalid credentials. Please verify your Telephone, National ID, or Password.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const fillDemo = (userIdent: string, userPass: string) => {
    setIdentifier(userIdent)
    setPassword(userPass)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f5f6f8]">
      {/* Left Column: Brand Hero (Midnight Black) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-[#010313] to-[#050819] text-[#b3b8d1]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#23A6BD] text-[#010313]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[18px] font-bold text-white tracking-tight">MHSG Rwanda</span>
              <span className="block text-[11px] text-[#23A6BD]">Service Coordination Marketplace</span>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-[32px] font-bold text-[#e6e8f1] leading-tight">
              Connect seamlessly with verified mechanical &amp; technical experts.
            </h2>
            <p className="mt-4 text-[14px] text-[#b3b8d1] leading-relaxed">
              MHSG Rwanda organizes incoming demand, matches verified local providers, protects customer contact privacy,
              and coordinates approved connections nationwide.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#23A6BD]" />
                <span className="text-[13px] text-[#e6e8f1]">Instant Login with Telephone or Rwandan National ID</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#23A6BD]" />
                <span className="text-[13px] text-[#e6e8f1]">Verified Garages, Mechanics &amp; Spare Parts Sellers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#23A6BD]" />
                <span className="text-[13px] text-[#e6e8f1]">Protected contact privacy until authorized connection unlock</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-[11px] text-[#55608f] border-t border-white/10 pt-4">
          <p className="font-semibold text-[#e6e8f1]">Owned &amp; Operated by FIX-IT-FAST CO. Ltd</p>
          <p>In Strategic Partnership with GAMU · Kigali, Rwanda</p>
          <p>&copy; 2026 All Rights Reserved.</p>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23A6BD] text-[#010313]">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="text-[16px] font-bold text-[#010313]">MHSG Rwanda</span>
          </div>

          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-[20px] font-bold text-[#010313]">Sign in to your account</h1>
              <ShieldCheck className="h-5 w-5 text-[#23A6BD]" />
            </div>
            <p className="text-[13px] text-[#6b7280]">
              Enter your Registered Phone Number, National ID, or Email
            </p>

            {/* Quick helper banner */}
            <div className="mt-4 rounded-lg bg-[#eefbfc] border border-[#23A6BD]/20 p-3 text-[12px] text-[#1a6c80] flex items-start gap-2.5">
              <KeyRound className="h-4 w-4 shrink-0 mt-0.5 text-[#23A6BD]" />
              <div>
                <strong>Easy Login:</strong> You can use your <strong>Telephone Number</strong> or <strong>National ID</strong> as both username and password!
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7280] mb-1">
                  Telephone, National ID, or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 0788220220 or 1199580011223344"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[13px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[#9ca3af]">
                    <Phone className="h-3.5 w-3.5" />
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Password or National ID
                  </label>
                  <span className="text-[11px] text-[#9ca3af]">Same as ID / Phone for quick access</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password or National ID"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[13px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-2.5 text-[13px] font-bold text-[#010313] hover:border-[#1a879c] hover:bg-[#1a879c] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Testing */}
            <div className="mt-6 pt-5 border-t border-[#f1f5f9]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                1-Click Fast Credentials (ID &amp; Phone Pre-configured)
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => fillDemo("admin@mhsg.rw", "Admin@Rwanda2026")}
                  className="rounded-lg bg-[#010313] text-white p-2 text-left font-medium hover:bg-[#1a1f3a] transition-all"
                >
                  <span className="block font-bold text-[#23A6BD]">Main Admin</span>
                  <span className="text-[10px] text-gray-300">admin@mhsg.rw</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("0788220220", "0788220220")}
                  className="rounded-lg bg-[#f3f4f6] text-[#1f2937] p-2 text-left font-medium hover:bg-[#e5e7eb] transition-all"
                >
                  <span className="block font-bold">Customer</span>
                  <span className="text-[10px] text-gray-500">Tel: 0788220220</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("1198880022334455", "1198880022334455")}
                  className="rounded-lg bg-[#f3f4f6] text-[#1f2937] p-2 text-left font-medium hover:bg-[#e5e7eb] transition-all"
                >
                  <span className="block font-bold">Garage Owner</span>
                  <span className="text-[10px] text-gray-500">ID: 11988800...</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("0788440440", "0788440440")}
                  className="rounded-lg bg-[#f3f4f6] text-[#1f2937] p-2 text-left font-medium hover:bg-[#e5e7eb] transition-all"
                >
                  <span className="block font-bold">Mechanic</span>
                  <span className="text-[10px] text-gray-500">Tel: 0788440440</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("0788550550", "0788550550")}
                  className="rounded-lg bg-[#f3f4f6] text-[#1f2937] p-2 text-left font-medium hover:bg-[#e5e7eb] transition-all"
                >
                  <span className="block font-bold">Spare Parts Seller</span>
                  <span className="text-[10px] text-gray-500">Tel: 0788550550</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("1199080055667788", "1199080055667788")}
                  className="rounded-lg bg-[#f3f4f6] text-[#1f2937] p-2 text-left font-medium hover:bg-[#e5e7eb] transition-all"
                >
                  <span className="block font-bold">Home Technician</span>
                  <span className="text-[10px] text-gray-500">ID: 11990800...</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-[12px] text-[#6b7280]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-[#1a6c80] hover:underline">
                Register with National ID / Telephone
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
