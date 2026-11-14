"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Wrench, Shield, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
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
        email,
        password,
      })

      if (res?.error) {
        setError("Invalid email or password.")
        setLoading(false)
        return
      }

      // Check session or role to redirect
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const fillDemo = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail)
    setPassword(rolePass)
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
              Connect seamlessly with verified mechanical & technical experts.
            </h2>
            <p className="mt-4 text-[14px] text-[#b3b8d1] leading-relaxed">
              MHSG Rwanda organizes incoming demand, matches verified local providers, protects customer contact privacy,
              and coordinates approved connections nationwide.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#23A6BD]" />
                <span className="text-[13px] text-[#e6e8f1]">Verified Garages, Mechanics & Spare Parts Sellers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#23A6BD]" />
                <span className="text-[13px] text-[#e6e8f1]">Protected contact privacy until authorized connection unlock</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#23A6BD]" />
                <span className="text-[13px] text-[#e6e8f1]">Centrally moderated transparent provider quotations</span>
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
        <div className="w-full max-w-[420px]">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23A6BD] text-[#010313]">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="text-[16px] font-bold text-[#010313]">MHSG Rwanda</span>
          </div>

          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-8 shadow-sm">
            <h1 className="text-[20px] font-bold text-[#010313]">Sign in to your account</h1>
            <p className="mt-1 text-[13px] text-[#6b7280]">Access your requests, quotes, or provider dashboard</p>

            {error && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af]">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15 transition-all"
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
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Testing */}
            <div className="mt-6 pt-5 border-t border-[#f1f5f9]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">
                Quick Test Credentials (Click to Fill)
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemo("admin@mhsg.rw", "Admin@Rwanda2026")}
                  className="rounded-md bg-[#eefbfc] px-2 py-1 text-[11px] font-semibold text-[#1a6c80] hover:bg-[#d2f4f7] border border-[#23A6BD]/30"
                >
                  Admin (FIX-IT-FAST)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("customer@demo.rw", "Demo@2026")}
                  className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[11px] font-semibold text-[#4b5563] hover:bg-[#e5e7eb]"
                >
                  Customer (Jean-Luc)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("garage@demo.rw", "Demo@2026")}
                  className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[11px] font-semibold text-[#4b5563] hover:bg-[#e5e7eb]"
                >
                  Garage Owner
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("mechanic@demo.rw", "Demo@2026")}
                  className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[11px] font-semibold text-[#4b5563] hover:bg-[#e5e7eb]"
                >
                  Mechanic
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-[12px] text-[#6b7280]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-[#1a6c80] hover:underline">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
