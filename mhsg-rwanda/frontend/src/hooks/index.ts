"use client";

import useSWR from "swr";
import {
  ServiceRequest,
  ProviderProfile,
  ProviderOffer,
  Connection,
  ServiceCategory,
} from "@/types";

export interface RequestFilters {
  status?: string;
  category?: string;
  district?: string;
  urgency?: string;
  search?: string;
}

export interface ProviderFilters {
  status?: string;
  verification_status?: string;
  district?: string;
  search?: string;
}

export interface AnalyticsSummary {
  metrics: {
    total_users: number;
    active_customers: number;
    registered_providers: number;
    verified_providers: number;
    total_requests: number;
    requests_last_30_days: number;
    completed_requests: number;
    total_connections: number;
    active_connections: number;
    total_revenue_rwf: number;
    revenue_last_30_days_rwf: number;
  };
  funnel: {
    submitted: number;
    reviewed: number;
    published: number;
    offers_received: number;
    approved: number;
    connected: number;
    completed: number;
  };
  revenue_breakdown: {
    request_fees_rwf: number;
    connection_fees_rwf: number;
    subscriptions_rwf: number;
    commissions_rwf: number;
  };
  district_breakdown: Array<{
    district: string;
    request_count: number;
    provider_count: number;
  }>;
}

export interface MatchingResult {
  provider_id: string;
  provider_name: string;
  composite_score: number;
  capability_score: number;
  distance_score: number;
  availability_score: number;
  verification_score: number;
  price_score: number;
  rating_score: number;
  reliability_score: number;
  is_verified: boolean;
  distance_km: number | null;
  rating: number;
  recommended: boolean;
}

/**
 * Hook to retrieve service requests list with optional filtering
 */
export function useRequests(filters?: RequestFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.district) params.set("district", filters.district);
  if (filters?.urgency) params.set("urgency", filters.urgency);
  if (filters?.search) params.set("search", filters.search);

  const query = params.toString() ? `?${params.toString()}` : "";
  const { data, error, isLoading, mutate } = useSWR<ServiceRequest[] | { results: ServiceRequest[] }>(
    `/api/v1/requests/${query}`
  );

  const requests: ServiceRequest[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return { requests, error, isLoading, mutate };
}

/**
 * Hook to retrieve a single service request detail
 */
export function useRequest(id: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR<ServiceRequest>(
    id ? `/api/v1/requests/${id}/` : null
  );

  return { request: data, error, isLoading, mutate };
}

/**
 * Hook to retrieve provider profiles list
 */
export function useProviders(filters?: ProviderFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.verification_status) params.set("verification_status", filters.verification_status);
  if (filters?.district) params.set("district", filters.district);
  if (filters?.search) params.set("search", filters.search);

  const query = params.toString() ? `?${params.toString()}` : "";
  const { data, error, isLoading, mutate } = useSWR<ProviderProfile[] | { results: ProviderProfile[] }>(
    `/api/v1/providers/${query}`
  );

  const providers: ProviderProfile[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return { providers, error, isLoading, mutate };
}

/**
 * Hook to retrieve a single provider's profile
 */
export function useProvider(id: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR<ProviderProfile>(
    id ? `/api/v1/providers/${id}/` : null
  );

  return { provider: data, error, isLoading, mutate };
}

/**
 * Hook to retrieve offers for a specific service request
 */
export function useOffers(requestId: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR<ProviderOffer[] | { results: ProviderOffer[] }>(
    requestId ? `/api/v1/offers/?request=${requestId}` : null
  );

  const offers: ProviderOffer[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return { offers, error, isLoading, mutate };
}

/**
 * Hook to retrieve connection records
 */
export function useConnections(requestId?: string) {
  const query = requestId ? `?request=${requestId}` : "";
  const { data, error, isLoading, mutate } = useSWR<Connection[] | { results: Connection[] }>(
    `/api/v1/connections/${query}`
  );

  const connections: Connection[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return { connections, error, isLoading, mutate };
}

/**
 * Hook to retrieve the hierarchy of service categories
 */
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<ServiceCategory[] | { results: ServiceCategory[] }>(
    "/api/v1/catalog/categories/"
  );

  const categories: ServiceCategory[] = Array.isArray(data)
    ? data
    : data?.results || [];

  return { categories, error, isLoading, mutate };
}

/**
 * Hook to retrieve dashboard analytics (Admin view)
 */
export function useAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsSummary>(
    "/api/v1/admin-panel/dashboard/"
  );

  return { analytics: data, error, isLoading, mutate };
}

/**
 * Hook to retrieve algorithmic matching recommendations for a request
 */
export function useMatchingResults(requestId: string | undefined | null) {
  const { data, error, isLoading, mutate } = useSWR<MatchingResult[] | { matches: MatchingResult[] }>(
    requestId ? `/api/v1/matching/recommendations/?request_id=${requestId}` : null
  );

  const results: MatchingResult[] = Array.isArray(data)
    ? data
    : (data as { matches?: MatchingResult[] })?.matches || [];

  return { matches: results, error, isLoading, mutate };
}
