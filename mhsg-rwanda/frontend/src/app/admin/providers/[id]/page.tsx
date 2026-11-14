"use client";

/**
 * Admin — Provider Detail Page
 *
 * Full review panel for a single provider:
 *  - Profile summary with verification status
 *  - Verification document review (approve / reject per document)
 *  - Location on a simple text display (Leaflet omitted for SSR safety)
 *  - Capabilities & availability schedule
 *  - Performance stats: total offers, connections, revenue, avg rating
 *  - Suspension / activation toggle
 *  - Admin note history
 */

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import PageHeading from "@/components/layout/PageHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  UserCheck,
  MapPin,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ------------------------------------------------------------------ types */

interface VerificationDoc {
  id: string;
  doc_type: string;
  doc_type_display: string;
  status: "pending" | "approved" | "rejected";
  file_url: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_note?: string;
}

interface Capability {
  id: string;
  category_name: string;
  subcategory?: string;
  years_experience: number;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
}

interface ProviderLocation {
  district: string;
  sector?: string;
  full_address?: string;
  latitude?: number;
  longitude?: number;
  radius_km: number;
}

interface ProviderDetail {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
    is_active: boolean;
    date_joined: string;
  };
  business_name?: string;
  bio: string;
  verification_status: string;
  is_active: boolean;
  avg_rating: number;
  total_reviews: number;
  subscription_plan?: string;
  capabilities: Capability[];
  availability: AvailabilitySlot[];
  location?: ProviderLocation;
  verification_documents: VerificationDoc[];
  stats: {
    total_offers: number;
    accepted_offers: number;
    total_connections: number;
    total_revenue_rwf: number;
    avg_response_hours: number;
  };
}

/* --------------------------------------------------------------- helpers */

function formatRWF(n: number): string {
  return `RWF ${n.toLocaleString()}`;
}

function DocStatusIcon({ status }: { status: string }) {
  if (status === "approved")
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (status === "rejected") return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
}

/* --------------------------------------------------------------- component */

export default function AdminProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: provider, isLoading } = useSWR<ProviderDetail>(
    `/api/v1/providers/${params.id}/admin_detail/`
  );

  const [docNotes, setDocNotes] = useState<Record<string, string>>({});
  const [suspendNote, setSuspendNote] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null);

  /* ---- document actions */
  const reviewDoc = async (
    docId: string,
    action: "approve" | "reject"
  ) => {
    setVerifyLoading(docId);
    try {
      await api.patch(
        `/api/v1/providers/${params.id}/documents/${docId}/review/`,
        { action, reviewer_note: docNotes[docId] ?? "" }
      );
      mutate(`/api/v1/providers/${params.id}/admin_detail/`);
    } catch {
      /* noop — toast would go here */
    } finally {
      setVerifyLoading(null);
    }
  };

  /* ---- suspension / activation */
  const toggleActive = async (activate: boolean) => {
    setActionLoading(true);
    try {
      await api.post(`/api/v1/providers/${params.id}/set_active/`, {
        is_active: activate,
        reason: suspendNote,
      });
      mutate(`/api/v1/providers/${params.id}/admin_detail/`);
      setSuspendOpen(false);
      setSuspendNote("");
    } catch {
      /* noop */
    } finally {
      setActionLoading(false);
    }
  };

  /* ---- grant / revoke verification */
  const setVerification = async (status: "verified" | "unverified") => {
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/providers/${params.id}/set_verification/`, {
        verification_status: status,
      });
      mutate(`/api/v1/providers/${params.id}/admin_detail/`);
    } catch {
      /* noop */
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-[13px] text-gray-500">Loading provider…</span>
      </div>
    );
  }

  if (!provider) {
    return (
      <EmptyState
        icon={<UserCheck className="w-10 h-10" />}
        title="Provider not found"
        description="This provider record does not exist or you lack permission to view it."
        action={
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            Go back
          </Button>
        }
      />
    );
  }

  const isVerified = provider.verification_status === "verified";
  const isActive = provider.is_active && provider.user.is_active;

  return (
    <div className="space-y-5">
      {/* Back + heading */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <PageHeading
          title={provider.business_name ?? provider.user.full_name}
          subtitle={`Provider ID: ${provider.id.slice(0, 8).toUpperCase()}`}
          icon={<UserCheck className="w-5 h-5" style={{ color: "#23A6BD" }} />}
        />
      </div>

      {/* Top action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={provider.verification_status} />
        <Badge variant={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Suspended"}
        </Badge>
        {provider.subscription_plan && (
          <Badge variant="info">{provider.subscription_plan}</Badge>
        )}

        <div className="flex gap-2 ml-auto">
          {/* Verification */}
          {isVerified ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVerification("unverified")}
              disabled={actionLoading}
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              Revoke Verification
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setVerification("verified")}
              disabled={actionLoading}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Mark Verified
            </Button>
          )}

          {/* Suspension */}
          {isActive ? (
            <Button
              size="sm"
              className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-xl px-3 py-1.5 text-[13px]"
              onClick={() => setSuspendOpen(true)}
            >
              Suspend Provider
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded-xl px-3 py-1.5 text-[13px]"
              onClick={() => toggleActive(true)}
              disabled={actionLoading}
            >
              Reactivate Provider
            </Button>
          )}
        </div>
      </div>

      {/* Suspend modal */}
      {suspendOpen && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <p className="text-[13px] font-semibold text-red-700">
                Suspend this provider?
              </p>
              <p className="text-[12px] text-red-600">
                The provider will lose access to new invitations and their active listings
                will be hidden.
              </p>
              <textarea
                value={suspendNote}
                onChange={(e) => setSuspendNote(e.target.value)}
                placeholder="Reason for suspension (required)…"
                rows={2}
                className="w-full border border-red-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(false)}
                  disabled={!suspendNote.trim() || actionLoading}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[13px] font-semibold disabled:opacity-40"
                >
                  Confirm Suspension
                </button>
                <button
                  onClick={() => { setSuspendOpen(false); setSuspendNote(""); }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[13px] text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Total Offers"
          value={provider.stats.total_offers}
          icon={<Briefcase className="w-4 h-4" />}
        />
        <StatCard
          label="Accepted"
          value={provider.stats.accepted_offers}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <StatCard
          label="Connections"
          value={provider.stats.total_connections}
          icon={<UserCheck className="w-4 h-4" />}
        />
        <StatCard
          label="Revenue (RWF)"
          value={provider.stats.total_revenue_rwf.toLocaleString()}
          icon={<FileText className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Rating"
          value={`${provider.avg_rating.toFixed(1)} / 5`}
          icon={<Star className="w-4 h-4" />}
        />
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile card */}
          <Card>
            <h3 className="text-[13px] font-semibold text-[#010313] mb-3">
              Profile
            </h3>
            <div className="space-y-2.5">
              <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email">
                <a
                  href={`mailto:${provider.user.email}`}
                  className="text-[#1a6c80] text-[12px] hover:underline"
                >
                  {provider.user.email}
                </a>
              </Row>
              <Row icon={<Phone className="w-3.5 h-3.5" />} label="Phone">
                {provider.user.phone_number || "—"}
              </Row>
              <Row icon={<Briefcase className="w-3.5 h-3.5" />} label="Role">
                <span className="capitalize">
                  {provider.user.role.replace(/_/g, " ")}
                </span>
              </Row>
              <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Joined">
                {new Date(provider.user.date_joined).toLocaleDateString()}
              </Row>
              <Row icon={<Star className="w-3.5 h-3.5" />} label="Reviews">
                {provider.total_reviews} review{provider.total_reviews !== 1 ? "s" : ""}
              </Row>
            </div>
            {provider.bio && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[12px] text-gray-600 leading-relaxed">{provider.bio}</p>
              </div>
            )}
          </Card>

          {/* Location card */}
          {provider.location && (
            <Card>
              <h3 className="text-[13px] font-semibold text-[#010313] mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: "#23A6BD" }} />
                Service Area
              </h3>
              <div className="space-y-1.5 text-[13px]">
                <p className="font-medium text-[#010313]">
                  {provider.location.district}
                  {provider.location.sector && `, ${provider.location.sector}`}
                </p>
                {provider.location.full_address && (
                  <p className="text-gray-500 text-[12px]">
                    {provider.location.full_address}
                  </p>
                )}
                <p className="text-[12px] text-gray-500">
                  Service radius:{" "}
                  <strong className="text-[#010313]">
                    {provider.location.radius_km} km
                  </strong>
                </p>
                {provider.location.latitude && (
                  <p className="text-[11px] text-gray-400 tabular-nums">
                    {provider.location.latitude.toFixed(5)},{" "}
                    {provider.location.longitude?.toFixed(5)}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Availability */}
          {provider.availability.length > 0 && (
            <Card>
              <h3 className="text-[13px] font-semibold text-[#010313] mb-3">
                Availability
              </h3>
              <div className="space-y-1.5">
                {provider.availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <span className="font-medium text-[#010313]">{slot.day_name}</span>
                    <span className="text-gray-500 tabular-nums">
                      {slot.start_time} – {slot.end_time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Verification Documents */}
          <Card>
            <h3 className="text-[13px] font-semibold text-[#010313] mb-4 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" style={{ color: "#23A6BD" }} />
              Verification Documents
              <span className="ml-auto text-[12px] font-normal text-gray-500">
                {provider.verification_documents.filter((d) => d.status === "approved").length}/
                {provider.verification_documents.length} approved
              </span>
            </h3>

            {provider.verification_documents.length === 0 ? (
              <p className="text-[13px] text-gray-400">No documents submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {provider.verification_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-gray-200 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <DocStatusIcon status={doc.status} />
                        <span className="text-[13px] font-semibold text-[#010313]">
                          {doc.doc_type_display}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                          doc.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[12px] text-gray-500">
                      <span>
                        Submitted:{" "}
                        {new Date(doc.submitted_at).toLocaleDateString()}
                      </span>
                      {doc.reviewed_at && (
                        <span>
                          · Reviewed:{" "}
                          {new Date(doc.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-[#1a6c80] hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View document
                      </a>
                    )}

                    {doc.reviewer_note && (
                      <p className="text-[12px] text-gray-500 italic">
                        Note: {doc.reviewer_note}
                      </p>
                    )}

                    {/* Review actions — only for pending docs */}
                    {doc.status === "pending" && (
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        <textarea
                          value={docNotes[doc.id] ?? ""}
                          onChange={(e) =>
                            setDocNotes((prev) => ({
                              ...prev,
                              [doc.id]: e.target.value,
                            }))
                          }
                          placeholder="Reviewer note (optional)…"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-[#23A6BD] resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => reviewDoc(doc.id, "approve")}
                            disabled={verifyLoading === doc.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-[12px] font-semibold disabled:opacity-40"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => reviewDoc(doc.id, "reject")}
                            disabled={verifyLoading === doc.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[12px] font-semibold disabled:opacity-40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Capabilities */}
          <Card>
            <h3 className="text-[13px] font-semibold text-[#010313] mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" style={{ color: "#23A6BD" }} />
              Service Capabilities
            </h3>

            {provider.capabilities.length === 0 ? (
              <p className="text-[13px] text-gray-400">No capabilities listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {provider.capabilities.map((cap) => (
                  <div
                    key={cap.id}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px]"
                  >
                    <span className="font-semibold text-[#010313]">
                      {cap.category_name}
                    </span>
                    {cap.subcategory && (
                      <span className="text-gray-500"> · {cap.subcategory}</span>
                    )}
                    <span className="text-gray-400 ml-1">
                      ({cap.years_experience}y exp.)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- helpers */

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-[12px]">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-500 w-16 shrink-0">{label}</span>
      <span className="text-[#010313] font-medium">{children}</span>
    </div>
  );
}
