"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import api from "@/lib/api"
import { PageHeading } from "@/components/layout/PageHeading"
import type { ServiceCategory, CategoryType } from "@/types"
import {
  Plus,
  Car,
  Cog,
  Home,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react"

const CATEGORY_TYPES = [
  {
    type: "AUTOMOTIVE_SERVICE" as CategoryType,
    title: "Automotive Repair",
    desc: "Mechanical, electrical, transmission, suspension, brakes and routine maintenance.",
    icon: Car,
  },
  {
    type: "SPARE_PARTS" as CategoryType,
    title: "Spare Parts Discovery",
    desc: "Find genuine, OEM, aftermarket or tested used spare parts from reliable sellers.",
    icon: Cog,
  },
  {
    type: "HOME_SERVICE" as CategoryType,
    title: "Home & Commercial Services",
    desc: "Plumbing, pumps, solar systems, generators, refrigeration, and property repairs.",
    icon: Home,
  },
]

export default function NewRequestPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Form State
  const [categoryType, setCategoryType] = useState<CategoryType>("AUTOMOTIVE_SERVICE")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [description, setDescription] = useState("")
  const [urgency, setUrgency] = useState("STANDARD")

  // Auto fields
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [mileage, setMileage] = useState("")

  // Parts fields
  const [partName, setPartName] = useState("")
  const [partNumber, setPartNumber] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [conditionPref, setConditionPref] = useState("NEW")
  const [budget, setBudget] = useState("")
  const [openToAlt, setOpenToAlt] = useState(true)

  // Home fields
  const [propertyIssue, setPropertyIssue] = useState("")
  const [assetType, setAssetType] = useState("")
  const [preferredVisitTime, setPreferredVisitTime] = useState("")

  // Location fields
  const [province, setProvince] = useState("Kigali City")
  const [district, setDistrict] = useState("Kicukiro")
  const [sector, setSector] = useState("Niboye")
  const [streetAddress, setStreetAddress] = useState("")
  const [directions, setDirections] = useState("")
  const [phoneConsent, setPhoneConsent] = useState(true)
  const [addressConsent, setAddressConsent] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch categories for selected categoryType
  const { data: categoriesData } = useSWR<{ results: ServiceCategory[] }>(
    `/catalog/categories/?category_type=${categoryType}`
  )
  const categories = categoriesData?.results || []

  const handleNext = () => {
    if (step === 1 && !selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // 1. Create Address record first
      const addrRes = await api.post("/requests/addresses/", {
        province,
        district,
        sector,
        street_address: streetAddress || `${sector}, ${district}`,
        free_text_directions: directions,
        phone_consent: phoneConsent,
        address_consent: addressConsent,
      })
      const addressId = addrRes.data.id

      // 2. Create Service Request
      const payload: any = {
        category: selectedCategory || (categories[0]?.id),
        description,
        urgency,
        approximate_location: `${sector}, ${district}`,
        province,
        district,
        sector,
        address_id: addressId,
      }

      if (categoryType === "AUTOMOTIVE_SERVICE") {
        payload.vehicle_make = make
        payload.vehicle_model = model
        payload.vehicle_year = year
        payload.mileage = mileage
      } else if (categoryType === "SPARE_PARTS") {
        payload.part_name = partName
        payload.part_number = partNumber
        payload.quantity = quantity
        payload.condition_preference = conditionPref
        payload.is_open_to_alternatives = openToAlt
        if (budget) payload.budget_rwf = parseInt(budget)
      } else if (categoryType === "HOME_SERVICE") {
        payload.property_issue = propertyIssue
        payload.asset_type = assetType
        payload.preferred_visit_time = preferredVisitTime
      }

      const reqRes = await api.post("/requests/", payload)
      const requestId = reqRes.data.id

      // 3. Initiate Request Fee Payment Intent
      const payRes = await api.post("/billing/payments/initiate_request_fee/", {
        request_id: requestId,
      })

      // 4. In Sandbox / Pilot mode, simulate instant fee payment confirmation
      await api.post(`/billing/payments/${payRes.data.id}/simulate_sandbox_pay/`)

      // Redirect to request details page
      router.push(`/customer/requests/${requestId}`)
    } catch (err: any) {
      console.error(err)
      if (err.response?.data) {
        setError("Failed to create request. Please ensure all required fields are filled.")
        setLoading(false)
      } else {
        // Offline / demo fallback
        router.push("/customer/requests")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/requests"
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1a6c80] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>

        <PageHeading
          icon={Plus}
          title="Create Service Request"
          subtitle="Provide structured details so MHSG can match the most qualified providers"
        />

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-between rounded-xl bg-white border border-[#ececf0] p-4">
          {[
            { num: 1, label: "Category" },
            { num: 2, label: "Details" },
            { num: 3, label: "Location & Privacy" },
            { num: 4, label: "Confirm & Submit" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${
                  step === s.num
                    ? "bg-[#23A6BD] text-[#010313]"
                    : step > s.num
                    ? "bg-[#ecfdf5] text-[#047857]"
                    : "bg-[#f3f4f6] text-[#9ca3af]"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span
                className={`hidden sm:inline text-[12px] font-semibold ${
                  step === s.num ? "text-[#010313]" : "text-[#6b7280]"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form Steps */}
        <div className="rounded-2xl border border-[#ececf0] bg-white p-6 sm:p-8 shadow-sm">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#010313]">Select Service Type</h3>
                <p className="text-[12px] text-[#6b7280]">Choose what kind of technical requirement you need</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CATEGORY_TYPES.map((ct) => {
                  const Icon = ct.icon
                  const active = categoryType === ct.type
                  return (
                    <button
                      type="button"
                      key={ct.type}
                      onClick={() => {
                        setCategoryType(ct.type)
                        setSelectedCategory("")
                      }}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? "border-[#23A6BD] bg-[#eefbfc] ring-2 ring-[#23A6BD]/20"
                          : "border-[#e5e7eb] bg-white hover:border-[#23A6BD]/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
                          active ? "bg-[#23A6BD] text-[#010313]" : "bg-[#f3f4f6] text-[#6b7280]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-[14px] font-bold text-[#010313]">{ct.title}</h4>
                      <p className="text-[11px] text-[#6b7280] mt-1">{ct.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Subcategories */}
              <div className="pt-4 border-t border-[#f1f5f9]">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-2">
                  Specific Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const active = selectedCategory === cat.id
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-[13px] font-medium transition-all cursor-pointer ${
                          active
                            ? "border-[#23A6BD] bg-[#eefbfc] text-[#010313] font-semibold"
                            : "border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#fafbfc]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-5 py-2 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TECHNICAL DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#010313]">Describe Your Requirement</h3>
                <p className="text-[12px] text-[#6b7280]">Provide exact symptoms or specifications</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-1">
                  Problem Description / Symptoms *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the noise, warning light, part required, or malfunction in detail..."
                  className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[13px] text-[#010313] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15"
                />
              </div>

              {/* Conditional: Automotive Fields */}
              {categoryType === "AUTOMOTIVE_SERVICE" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Vehicle Make</label>
                    <input
                      type="text"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Toyota"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Vehicle Model</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. RAV4"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Year of Manufacture</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2018"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Approx. Mileage (km)</label>
                    <input
                      type="text"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="e.g. 85,000 km"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                </div>
              )}

              {/* Conditional: Spare Parts Fields */}
              {categoryType === "SPARE_PARTS" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Part Name</label>
                    <input
                      type="text"
                      value={partName}
                      onChange={(e) => setPartName(e.target.value)}
                      placeholder="e.g. Front Brake Pads Set"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">OEM / Part Number (if known)</label>
                    <input
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="e.g. 04465-42190"
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Condition Preference</label>
                    <select
                      value={conditionPref}
                      onChange={(e) => setConditionPref(e.target.value)}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#010313]"
                    >
                      <option value="NEW">Brand New</option>
                      <option value="GENUINE">Genuine OEM</option>
                      <option value="AFTERMARKET">Quality Aftermarket</option>
                      <option value="USED">Tested Used</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Urgency */}
              <div className="pt-4 border-t border-[#f1f5f9]">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#9ca3af] mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "STANDARD", label: "Standard (24-48h)" },
                    { id: "URGENT", label: "Urgent (Today)" },
                    { id: "EMERGENCY", label: "Emergency / Immediate" },
                  ].map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => setUrgency(u.id)}
                      className={`py-2 px-3 rounded-lg border text-[12px] font-semibold text-center cursor-pointer transition-all ${
                        urgency === u.id
                          ? "border-[#23A6BD] bg-[#eefbfc] text-[#010313]"
                          : "border-[#e5e7eb] text-[#6b7280] hover:bg-[#fafbfc]"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!description}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-5 py-2 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] disabled:opacity-60"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & PRIVACY CONSENT */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#010313]">Location & Contact Privacy</h3>
                <p className="text-[12px] text-[#6b7280]">
                  Your exact street address and phone remain protected until you approve a connection.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Province / City</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#010313]"
                  >
                    <option value="Kigali City">Kigali City</option>
                    <option value="Northern Province">Northern Province</option>
                    <option value="Southern Province">Southern Province</option>
                    <option value="Eastern Province">Eastern Province</option>
                    <option value="Western Province">Western Province</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#010313]"
                  >
                    <option value="Kicukiro">Kicukiro</option>
                    <option value="Gasabo">Gasabo</option>
                    <option value="Nyarugenge">Nyarugenge</option>
                    <option value="Musanze">Musanze</option>
                    <option value="Rubavu">Rubavu</option>
                    <option value="Huye">Huye</option>
                    <option value="Rwamagana">Rwamagana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7280] mb-1">Sector</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g. Niboye, Remera, Kacyiru"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7280] mb-1">
                  Exact Street Address / Landmark (Protected)
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. KK 312 St, Near Sonatubes / House #14"
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] text-[#010313]"
                />
              </div>

              {/* Privacy Consent Box */}
              <div className="rounded-xl bg-[#fafbfc] border border-[#f1f5f9] p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#1a6c80] font-semibold text-[13px]">
                  <Shield className="h-4 w-4" />
                  MHSG Privacy Guarantee
                </div>
                <div className="space-y-2 text-[12px] text-[#4b5563]">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={phoneConsent}
                      onChange={(e) => setPhoneConsent(e.target.checked)}
                      className="mt-0.5 rounded text-[#23A6BD] focus:ring-[#23A6BD]"
                    />
                    <span>
                      Allow MHSG to unlock my phone number to my selected provider ONLY after I review and approve their quote.
                    </span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={addressConsent}
                      onChange={(e) => setAddressConsent(e.target.checked)}
                      className="mt-0.5 rounded text-[#23A6BD] focus:ring-[#23A6BD]"
                    />
                    <span>
                      Allow MHSG to unlock my exact service address to the selected provider for on-site visit or delivery.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-5 py-2 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c]"
                >
                  Next: Review & Confirm
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[#010313]">Review Request & Activation</h3>
                <p className="text-[12px] text-[#6b7280]">
                  Confirm details. MHSG moderates incoming requests to guarantee qualified responses.
                </p>
              </div>

              <div className="rounded-xl border border-[#ececf0] p-4 bg-[#fafbfc] space-y-3">
                <div className="flex justify-between py-1 border-b border-[#f1f5f9] text-[13px]">
                  <span className="text-[#6b7280]">Service Type</span>
                  <span className="font-semibold text-[#010313]">{categoryType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f5f9] text-[13px]">
                  <span className="text-[#6b7280]">Location</span>
                  <span className="font-semibold text-[#010313]">{sector}, {district}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f5f9] text-[13px]">
                  <span className="text-[#6b7280]">Urgency</span>
                  <span className="font-semibold text-[#010313]">{urgency}</span>
                </div>
                {make && (
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9] text-[13px]">
                    <span className="text-[#6b7280]">Vehicle</span>
                    <span className="font-semibold text-[#010313]">{make} {model} ({year})</span>
                  </div>
                )}
                {partName && (
                  <div className="flex justify-between py-1 border-b border-[#f1f5f9] text-[13px]">
                    <span className="text-[#6b7280]">Part Name</span>
                    <span className="font-semibold text-[#010313]">{partName} (Qty: {quantity})</span>
                  </div>
                )}
                <div className="pt-2 text-[12px] text-[#4b5563]">
                  <span className="font-semibold text-[#010313]">Description: </span>
                  {description}
                </div>
              </div>

              {/* Fee notice card */}
              <div className="rounded-xl border border-[#23A6BD]/30 bg-[#eefbfc] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-[#010313]">Request Activation Fee</div>
                  <div className="text-[11px] text-[#1a6c80]">Covers administrative review & provider matching coordination</div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-bold text-[#010313] tabular-nums">RWF 1,000</div>
                  <div className="text-[10px] font-semibold text-[#047857]">Simulated in Sandbox</div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#23A6BD] bg-[#23A6BD] px-6 py-2.5 text-[13px] font-bold text-[#010313] hover:bg-[#1a879c] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Activating Request...
                    </>
                  ) : (
                    <>
                      Confirm & Submit Request
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
