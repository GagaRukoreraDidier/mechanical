import { NextRequest, NextResponse } from "next/server"
import {
  getRequestsList,
  getRequestById,
  createServiceRequest,
  getOffersByRequest,
  getAllOffers,
  getProvidersList,
  getConnectionsList,
  getCategoriesList,
  getSubscriptionPlansList,
  getMessagesList,
  getAnalyticsMetrics,
  registerNewUser,
  findUserByIdentifier,
  validateUserCredentials,
} from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = "/" + (params.slug || []).join("/")

  try {
    // 1. Service Requests
    if (path === "/requests" || path === "/requests/") {
      const requests = getRequestsList()
      return NextResponse.json({ count: requests.length, results: requests })
    }

    const reqMatch = path.match(/^\/requests\/([^/]+)\/?$/)
    if (reqMatch) {
      const reqId = reqMatch[1]
      const request = getRequestById(reqId)
      if (!request) return NextResponse.json({ detail: "Not found" }, { status: 404 })
      return NextResponse.json(request)
    }

    const reqOffersMatch = path.match(/^\/requests\/([^/]+)\/offers\/?$/)
    if (reqOffersMatch) {
      const reqId = reqOffersMatch[1]
      const offers = getOffersByRequest(reqId)
      return NextResponse.json({ count: offers.length, results: offers })
    }

    const reqMatchingMatch = path.match(/^\/requests\/([^/]+)\/matching\/?$/)
    if (reqMatchingMatch) {
      const providers = getProvidersList()
      const ranked = providers.map((p: any, idx: number) => ({
        provider: p,
        total_score: 95 - idx * 5,
        component_scores: {
          capability_fit: 90,
          distance_score: 95,
          availability_score: 90,
          verification_score: 100,
          rating_score: 98,
        },
        recommendation_tier: idx === 0 ? "PRIMARY_MATCH" : "COMPETITIVE_ALTERNATIVE",
      }))
      return NextResponse.json({ ranked_providers: ranked })
    }

    // 2. Offers
    if (path === "/offers" || path === "/offers/") {
      const offers = getAllOffers()
      return NextResponse.json({ count: offers.length, results: offers })
    }

    // 3. Providers
    if (path === "/providers" || path === "/providers/") {
      const providers = getProvidersList()
      return NextResponse.json({ count: providers.length, results: providers })
    }

    if (path === "/providers/me" || path === "/providers/me/") {
      const providers = getProvidersList()
      return NextResponse.json(providers[0] || {})
    }

    const provMatch = path.match(/^\/providers\/([^/]+)\/?$/)
    if (provMatch) {
      const providers = getProvidersList()
      const p = providers.find((item: any) => item.id === provMatch[1])
      if (!p) return NextResponse.json({ detail: "Provider not found" }, { status: 404 })
      return NextResponse.json(p)
    }

    // 4. Connections
    if (path === "/connections" || path === "/connections/") {
      const connections = getConnectionsList()
      return NextResponse.json({ count: connections.length, results: connections })
    }

    // 5. Categories
    if (path === "/catalog/categories" || path === "/catalog/categories/" || path === "/categories" || path === "/categories/") {
      const categories = getCategoriesList()
      return NextResponse.json({ count: categories.length, results: categories })
    }

    // 6. Subscriptions
    if (path === "/subscriptions/plans" || path === "/subscriptions/plans/") {
      const plans = getSubscriptionPlansList()
      return NextResponse.json({ count: plans.length, results: plans })
    }

    if (path === "/subscriptions/provider-subs/my_subscription" || path === "/subscriptions/provider-subs/my_subscription/") {
      return NextResponse.json({
        id: "sub-active",
        status: "ACTIVE",
        plan: {
          name: "Professional Garage Plan",
          price_rwf: 25000,
          included_connections: 10,
        },
        included_credits_used: 3,
        start_date: "2026-11-01",
        end_date: "2026-11-30",
      })
    }

    // 7. Billing & Fee Configs
    if (path === "/billing/fee-configs" || path === "/billing/fee-configs/") {
      return NextResponse.json({
        results: [
          { fee_type: "REQUEST_FEE", amount_rwf: 1000, description: "Customer Request Activation Fee" },
          { fee_type: "CONNECTION_FEE", amount_rwf: 2500, description: "Provider Connection Fee" },
        ],
      })
    }

    // 8. Admin Analytics
    if (path === "/admin-panel/analytics" || path === "/admin-panel/analytics/" || path === "/analytics" || path === "/analytics/") {
      const metrics = getAnalyticsMetrics()
      return NextResponse.json({ metrics })
    }

    // 9. Messaging
    if (path === "/messaging/threads" || path === "/messaging/threads/" || path === "/api/v1/messaging/threads" || path === "/api/v1/messaging/threads/") {
      const msgs = getMessagesList()
      return NextResponse.json([
        {
          id: "conn-004",
          with_user: { full_name: "Kigali Auto Works Ltd", role: "GARAGE" },
          request_summary: "Toyota Land Cruiser Prado 150 Suspension",
          last_message: msgs[msgs.length - 1]?.content || "Ready for inspection",
          last_message_at: "2 hours ago",
          unread_count: 0,
        },
      ])
    }

    return NextResponse.json({ message: "MHSG Rwanda Native Database API", path }, { status: 200 })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = "/" + (params.slug || []).join("/")

  try {
    const body = await req.json().catch(() => ({}))

    // 1. User Registration
    if (path === "/auth/register" || path === "/auth/register/") {
      const user = registerNewUser({
        email: body.email,
        phone: body.phone,
        national_id: body.national_id,
        full_name: body.full_name,
        role: body.role,
        password: body.password,
        preferred_language: body.preferred_language,
      })
      return NextResponse.json(
        {
          message: "Registration successful",
          user,
        },
        { status: 201 }
      )
    }

    // 2. Direct Auth Login check
    if (path === "/auth/login" || path === "/auth/login/") {
      const identifier = body.email || body.phone || body.username || body.identifier
      const password = body.password
      const user = validateUserCredentials(identifier, password)
      if (!user) {
        return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 })
      }
      return NextResponse.json({
        access: "sqlite-jwt-token-access",
        refresh: "sqlite-jwt-token-refresh",
        user,
      })
    }

    // 3. Create Service Request
    if (path === "/requests" || path === "/requests/") {
      const newReq = createServiceRequest(body)
      return NextResponse.json(newReq, { status: 201 })
    }

    return NextResponse.json({ received: true, path, body }, { status: 200 })
  } catch (error: any) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
