import Link from "next/link"
import { Wrench, Shield, CheckCircle2, Car, Cog, Home, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#010313]">
      {/* Top Navbar */}
      <header className="border-b border-[#ececf0] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#23A6BD] text-[#010313]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-[16px] tracking-tight text-[#010313]">MHSG Rwanda</span>
              <span className="ml-2 text-[10px] font-bold text-[#1a6c80] uppercase tracking-wider bg-[#eefbfc] px-2 py-0.5 rounded-full">
                FIX-IT-FAST CO. Ltd &amp; GAMU
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#1a6c80] hover:border-[#23A6BD] hover:bg-[#23A6BD] hover:text-[#010313] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-4 py-1.5 text-[13px] font-semibold text-[#010313] hover:bg-[#1a879c] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#010313] to-[#050819] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#23A6BD]/15 border border-[#23A6BD]/30 px-3.5 py-1 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#23A6BD] animate-pulse" />
            <span className="text-[12px] font-semibold text-[#73d9e4]">
              Owned &amp; Operated by FIX-IT-FAST CO. Ltd · Strategic Partner: GAMU
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e6e8f1] leading-tight">
            Connecting Rwanda with Verified <span className="text-[#23A6BD]">Garages</span>,{" "}
            <span className="text-[#23A6BD]">Mechanics</span> &{" "}
            <span className="text-[#23A6BD]">Parts Sellers</span>
          </h1>
          <p className="mt-5 text-[15px] sm:text-[17px] text-[#b3b8d1] max-w-2xl mx-auto leading-relaxed">
            Submit your mechanical or spare-parts request. MHSG compares verified local providers, transparent quotes,
            and coordinates an approved, direct connection.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#23A6BD] px-6 py-3 text-[14px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm"
            >
              Submit a Service Request
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register?role=provider"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-[14px] font-semibold text-white hover:bg-white/10 transition-all"
            >
              Register as a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a6c80]">Marketplace Scope</p>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-[#010313] mt-1">Core Service Sectors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eefbfc] text-[#1a6c80] mb-4">
              <Car className="h-6 w-6" />
            </div>
            <h3 className="text-[16px] font-bold text-[#010313]">Automotive Repairs</h3>
            <p className="text-[13px] text-[#6b7280] mt-2 leading-relaxed">
              Garages and mobile mechanics for engine repair, transmission, electrical diagnostics, suspension, brake systems and routine servicing.
            </p>
            <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#1a6c80]">Kigali & Nationwide</span>
              <span className="text-[11px] font-bold text-[#010313] bg-[#f3f4f6] px-2 py-0.5 rounded-full">Available</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eefbfc] text-[#1a6c80] mb-4">
              <Cog className="h-6 w-6" />
            </div>
            <h3 className="text-[16px] font-bold text-[#010313]">Spare Parts Discovery</h3>
            <p className="text-[13px] text-[#6b7280] mt-2 leading-relaxed">
              Find genuine OEM, aftermarket or tested used spare parts from reputable suppliers with verified stock and price quotes.
            </p>
            <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#1a6c80]">Direct Quotes</span>
              <span className="text-[11px] font-bold text-[#010313] bg-[#f3f4f6] px-2 py-0.5 rounded-full">Available</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-[#ececf0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eefbfc] text-[#1a6c80] mb-4">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-[16px] font-bold text-[#010313]">Home & Commercial Technical Services</h3>
            <p className="text-[13px] text-[#6b7280] mt-2 leading-relaxed">
              Plumbing, water booster pumps, solar systems, generators, commercial refrigeration, and specialized property maintenance.
            </p>
            <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#1a6c80]">On-Demand</span>
              <span className="text-[11px] font-bold text-[#010313] bg-[#f3f4f6] px-2 py-0.5 rounded-full">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 border-y border-[#ececf0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a6c80]">Operating Principles</p>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#010313] mt-1">How MHSG Coordinates Requests</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative p-5 rounded-2xl bg-[#fafbfc] border border-[#f1f5f9]">
              <span className="text-[20px] font-bold text-[#1a6c80] tabular-nums">01</span>
              <h4 className="font-semibold text-[14px] text-[#010313] mt-2">Submit Request</h4>
              <p className="text-[12px] text-[#6b7280] mt-1">
                Provide structured details (vehicle model, part numbers, symptoms, approximate location).
              </p>
            </div>
            <div className="relative p-5 rounded-2xl bg-[#fafbfc] border border-[#f1f5f9]">
              <span className="text-[20px] font-bold text-[#1a6c80] tabular-nums">02</span>
              <h4 className="font-semibold text-[14px] text-[#010313] mt-2">Review & Match</h4>
              <p className="text-[12px] text-[#6b7280] mt-1">
                Admin moderates the request and matches eligible providers by capability, radius, and rating.
              </p>
            </div>
            <div className="relative p-5 rounded-2xl bg-[#fafbfc] border border-[#f1f5f9]">
              <span className="text-[20px] font-bold text-[#1a6c80] tabular-nums">03</span>
              <h4 className="font-semibold text-[14px] text-[#010313] mt-2">Compare & Approve</h4>
              <p className="text-[12px] text-[#6b7280] mt-1">
                Review transparent quotes, lead times, warranties. Customer approves the selected provider.
              </p>
            </div>
            <div className="relative p-5 rounded-2xl bg-[#fafbfc] border border-[#f1f5f9]">
              <span className="text-[20px] font-bold text-[#1a6c80] tabular-nums">04</span>
              <h4 className="font-semibold text-[14px] text-[#010313] mt-2">Secure Unlock</h4>
              <p className="text-[12px] text-[#6b7280] mt-1">
                Upon verified connection fee, customer-consented contact details are released for direct agreement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#010313] text-[#b3b8d1] py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#23A6BD] text-[#010313]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-white tracking-tight">MHSG Rwanda</span>
              <p className="text-[11px] text-[#73d9e4]">
                Owned &amp; Operated by <strong className="text-white">FIX-IT-FAST CO. Ltd</strong> &amp; <strong className="text-white">GAMU</strong>
              </p>
            </div>
          </div>
          <div className="text-center md:text-right text-[11px] text-[#55608f] space-y-1">
            <p>Centrally Coordinated Demand &amp; Provider Discovery Marketplace · Kigali, Rwanda</p>
            <p>&copy; 2026 FIX-IT-FAST CO. Ltd &amp; GAMU. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
