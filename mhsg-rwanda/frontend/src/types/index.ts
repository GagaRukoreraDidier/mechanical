export type UserRole =
  | "CUSTOMER"
  | "SELLER"
  | "GARAGE"
  | "MECHANIC"
  | "HOME_TECH"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "SUPPORT"

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  preferred_language: "en" | "rw" | "fr"
  phone_consent: boolean
  address_consent: boolean
  date_joined: string
}

export type CategoryType = "AUTOMOTIVE_SERVICE" | "SPARE_PARTS" | "HOME_SERVICE"

export interface ServiceCategory {
  id: string
  parent?: string | null
  name: string
  slug: string
  category_type: CategoryType
  description?: string
  icon_name?: string
  is_active: boolean
  children?: ServiceCategory[]
}

export type RequestStatus =
  | "DRAFT"
  | "AWAITING_REQUEST_PAYMENT"
  | "SUBMITTED"
  | "NEEDS_INFORMATION"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "OFFERS_RECEIVED"
  | "AWAITING_CUSTOMER_APPROVAL"
  | "CUSTOMER_APPROVED"
  | "AWAITING_CONNECTION_PAYMENT"
  | "CONNECTION_UNLOCKED"
  | "CONNECTED"
  | "IN_PROGRESS_OR_ARRANGED"
  | "COMPLETED"
  | "CANCELLED"
  | "CLOSED"
  | "REPORTED"

export type Urgency = "STANDARD" | "URGENT" | "EMERGENCY"
export type FeeStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "WAIVED" | "REFUNDED"

export interface CustomerAddress {
  id: string
  province: string
  district: string
  sector: string
  cell?: string
  village?: string
  street_address: string
  access_instructions?: string
  free_text_directions?: string
  latitude?: number
  longitude?: number
  is_default: boolean
  phone_consent: boolean
  address_consent: boolean
}

export interface ServiceRequest {
  id: string
  customer?: User
  customer_name?: string
  customer_phone?: string
  customer_address?: CustomerAddress
  category: string
  category_name?: string
  category_detail?: ServiceCategory
  subcategory?: string
  description: string
  urgency: Urgency
  status: RequestStatus
  fee_status: FeeStatus
  approximate_location: string
  province: string
  district: string
  sector?: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_year?: string
  vehicle_engine?: string
  mileage?: string
  part_name?: string
  part_number?: string
  quantity?: number
  condition_preference?: string
  is_open_to_alternatives?: boolean
  budget_rwf?: number
  property_issue?: string
  asset_type?: string
  preferred_visit_time?: string
  created_at: string
  submitted_at?: string
  published_at?: string
}

export type VerificationStatus =
  | "UNVERIFIED"
  | "IDENTITY_CHECKED"
  | "BUSINESS_CHECKED"
  | "DOCS_REVIEWED"
  | "CERTIFIED"

export interface ProviderLocation {
  id: string
  province: string
  district: string
  sector?: string
  street_address?: string
  service_radius_km: number
  location_visibility: "EXACT" | "APPROXIMATE" | "DISTRICT_ONLY"
  is_primary: boolean
}

export interface ProviderCapability {
  id: string
  category: string
  category_name?: string
  specialty?: string
  vehicle_brands: string[]
  vehicle_systems: string[]
  equipment: string[]
  capacity_notes?: string
}

export interface ProviderProfile {
  id: string
  user?: string
  user_email?: string
  user_phone?: string
  display_name: string
  description?: string
  provider_types: string[]
  verification_status: VerificationStatus
  is_active: boolean
  is_suspended: boolean
  rating_average: number
  rating_count: number
  locations?: ProviderLocation[]
  capabilities?: ProviderCapability[]
  created_at: string
}

export type OfferStatus = "DRAFT" | "SUBMITTED" | "REVISED" | "WITHDRAWN" | "SELECTED" | "REJECTED"

export interface ProviderOffer {
  id: string
  request: string
  provider: string
  provider_name?: string
  provider_verification?: VerificationStatus
  provider_rating?: number
  price_min_rwf?: number
  price_max_rwf?: number
  currency: string
  scope: string
  availability: string
  estimated_lead_time: string
  stock_status?: string
  item_condition?: string
  warranty_terms?: string
  limitations?: string
  status: OfferStatus
  is_genuine_confirmed: boolean
  submitted_at: string
}

export interface ProviderSelection {
  id: string
  request: string
  selected_offer: string
  offer_detail?: ProviderOffer
  admin_name?: string
  rationale: string
  customer_decision: "PENDING" | "APPROVED" | "REJECTED" | "NO_RESPONSE"
  admin_selected_at: string
  customer_decided_at?: string
}

export interface Connection {
  id: string
  request: string
  request_detail?: ServiceRequest
  provider: string
  provider_detail?: ProviderProfile
  customer_approval_at: string
  connection_status: "PENDING_PAYMENT" | "ACTIVE" | "CANCELLED" | "DISPUTED"
  unlocked_fields: string[]
  unlocked_at?: string
  outcome?: string
  outcome_notes?: string
  customer_phone?: string
  customer_address?: CustomerAddress
  created_at: string
}

export interface Payment {
  id: string
  payer_email?: string
  purpose: "REQUEST_FEE" | "PROVIDER_SUBSCRIPTION" | "CONNECTION_FEE" | "REFUND" | "ADMIN_CREDIT"
  related_object_type: string
  related_object_id: string
  amount_rwf: number
  currency: string
  payment_provider: string
  external_reference?: string
  internal_reference: string
  status: "CREATED" | "PENDING" | "SUCCEEDED" | "FAILED" | "EXPIRED" | "REFUNDED"
  created_at: string
  succeeded_at?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price_rwf: number
  billing_period: "MONTHLY" | "ANNUAL"
  included_connections: number
  discounted_connection_fee_rwf: number
  features: string[]
  is_active: boolean
}

export interface ProviderSubscription {
  id: string
  provider: string
  plan: SubscriptionPlan
  plan_details?: SubscriptionPlan
  plan_name?: string
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING"
  starts_at: string
  expires_at: string
  auto_renew: boolean
  remaining_connections?: number
  credits_remaining?: number
}

export interface AnalyticsMetrics {
  total_requests: number
  under_review_requests: number
  published_requests: number
  completed_requests: number
  total_providers: number
  active_providers: number
  unverified_providers: number
  total_connections: number
  unlocked_connections: number
  total_revenue_rwf: number
}
