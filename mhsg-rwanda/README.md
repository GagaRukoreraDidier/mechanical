# MHSG Rwanda — Platform Implementation Blueprint & Codebase

> **Centrally Coordinated Demand & Provider Discovery Marketplace for Rwanda**  
> Connecting customers with verified Garages, Mechanics, Spare-Parts Sellers and Home Service Technicians.

---

## 1. Executive Summary & Principles

MHSG Rwanda is **not** a repair shop, delivery fleet, inventory owner, or escrow business. It coordinates demand and provider discovery:

1. **Customer Submits Request**: Provides vehicle/part/property details, approximate sector/district, and pays a configured request activation fee (e.g. RWF 1,000).
2. **Administrator Reviews & Moderates**: Checks completeness, categorizes, validates district, and publishes to eligible local providers.
3. **Providers Submit Offers**: Verified garages, mechanics, and sellers submit genuine quotations, lead times, warranties, and stock status.
4. **Algorithmic Matching & Recommendation**: MHSG decision engine ranks providers based on Capability Fit (25%), Distance/Locality (20%), Availability (15%), Verification (15%), Price (10%), Rating (10%), and Reliability (5%). The administrator reviews and recommends a provider.
5. **Customer Approves Connection**: Customer reviews the quote and approves the recommendation.
6. **Provider Pays Connection Fee**: Provider confirms the connection fee (e.g. RWF 2,500) or consumes a monthly subscription credit.
7. **Secure Contact Unlocking**: MHSG unlocks customer-consented contact details (phone, exact address) only after payment verification.
8. **Direct Agreement**: Customer and provider directly arrange execution, payment, delivery/collection, and workmanship.

---

## 2. Design System (frontend-design skill)

Built strictly in accordance with `skills/frontend-design/SKILL.md`:

| Token | Hex | Role |
|---|---|---|
| **Midnight Black** | `#010313` | Dark shell (sidebar, hero headers, primary text) |
| **Chrysocolla Blue** | `#23A6BD` | Primary accent fill (buttons, active tabs, icon tiles) |
| **Accent Ink** | `#1a6c80` | High-contrast AA-safe text on light surfaces |
| **Accent Tint** | `#eefbfc` | Soft tinted backgrounds, chips, stat cards |
| **Canvas** | `#f5f6f8` | Page background |
| **Surface** | `#ffffff` | Floating white cards |
| **Border** | `#ececf0` | Hairline card separation |
| **Typography** | Poppins | Weights 400, 500, 600, 700 (`@fontsource/poppins`) |

---

## 3. Architecture & Tech Stack

```
mhsg-rwanda/
├── backend/                  # Python 3.12+ Django & Django REST Framework
│   ├── config/               # Settings (base, development, production), URLs, Celery
│   ├── apps/
│   │   ├── accounts/         # Custom User model (Customer, Garage, Mechanic, Seller, Admin)
│   │   ├── catalog/          # Service categories, product listings, service listings
│   │   ├── locations/        # Rwanda administrative geography (Provinces, Districts, Sectors)
│   │   ├── providers/        # Profiles, locations (PostGIS/spatial), capabilities, documents
│   │   ├── requests/         # Service requests, status engine (18 states), privacy controls
│   │   ├── offers/           # Provider quotations and admin recommendations
│   │   ├── matching/         # Decision support ranking engine with component scores
│   │   ├── connections/      # Approval, connection fee verification, contact unlocking
│   │   ├── billing/          # Payment intents, sandbox simulation, fee tariffs (RWF)
│   │   ├── subscriptions/    # Tiered provider monthly plans & connection allowances
│   │   ├── messaging/        # In-platform communications
│   │   ├── notifications/    # Alerts & dispatch
│   │   ├── reviews/          # Customer star ratings & feedback
│   │   ├── moderation/       # Complaints & administrative dispute records
│   │   ├── audit/            # Append-only compliance AuditEvent log
│   │   └── analytics/        # Executive operational & financial dashboards
│   └── requirements/         # base.txt & dev.txt
├── frontend/                 # Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, Registration with role picker
│   │   │   ├── (customer)/   # Customer dashboard, request wizard, detail view
│   │   │   ├── (provider)/   # Provider dashboard, quote submission, connections
│   │   │   └── (admin)/      # Moderation queue, matching engine, analytics, fees
│   │   ├── components/       # Design system UI library (Cards, StatCards, Badges, Buttons)
│   │   ├── lib/              # ds.ts tokens, api.ts Axios client, utils.ts
│   │   └── types/            # TypeScript interfaces
├── docker-compose.yml        # PostgreSQL+PostGIS, Redis, Django, Celery, Next.js
└── .env.example              # Environment configuration template
```

---

## 4. Getting Started & Running the Application

### Option A: Running with Docker Compose (Recommended in production)

```bash
cd c:\Users\NISR\Documents\MHSG-RWANDA\mhsg-rwanda
copy .env.example .env
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API & Swagger: `http://localhost:8000/api/v1/schema/swagger/`
- Django Admin: `http://localhost:8000/admin/`

---

### Option B: Running Locally

#### 1. Backend Setup (Django)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install requirements
pip install -r requirements\base.txt

# Run migrations
python manage.py migrate

# Seed Rwanda baseline data (provinces, categories, admin, fee tariffs)
python manage.py seed_mhsg_data

# Start development server
python manage.py runserver 0.0.0.0:8000
```

#### 2. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 5. Seed Test Credentials

After running `python manage.py seed_mhsg_data`, you can sign in immediately with:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Super Admin** | `admin@mhsg.rw` | `Admin@Rwanda2026` | `/admin/dashboard` |
| **Customer** | `customer@example.com` | `Password123!` | `/dashboard` |
| **Provider (Garage)** | `garage@example.com` | `Password123!` | `/provider/dashboard` |

*(You can also use the **Quick Test Credentials** buttons directly on the Login screen `/login`)*.

---

## 6. Request Status Lifecycle State Machine

```
[DRAFT]
   │
   ▼
[AWAITING_REQUEST_PAYMENT]  (Customer pays activation fee)
   │
   ▼
[SUBMITTED]
   │
   ▼
[UNDER_REVIEW] ───────────► [NEEDS_INFORMATION] or [REJECTED]
   │
   ▼
[READY_TO_PUBLISH]
   │
   ▼
[PUBLISHED]                (Broadcast to matching district providers)
   │
   ▼
[OFFERS_RECEIVED]          (Providers submit transparent quotes)
   │
   ▼
[AWAITING_CUSTOMER_APPROVAL] (Admin recommends provider with rationale)
   │
   ▼
[CUSTOMER_APPROVED]
   │
   ▼
[AWAITING_CONNECTION_PAYMENT] (Provider confirms connection fee)
   │
   ▼
[CONNECTION_UNLOCKED]      (Phone & exact address securely unlocked)
   │
   ▼
[CONNECTED]                (Direct agreement and on-site execution)
   │
   ▼
[IN_PROGRESS_OR_ARRANGED]
   │
   ▼
[COMPLETED] ──────────────► [CLOSED]
```

---

## 7. Security & Privacy Rules

- **Privacy by Default**: Customer phone numbers and exact street addresses are strictly hidden from providers until the customer approves the provider AND the provider's connection payment is verified.
- **Idempotent Payments**: Double webhooks or retries cannot cause double unlocking or duplicate billing.
- **Append-only Financial & Audit Logs**: All state transitions and unlocking events generate an immutable `AuditEvent` and `FinancialEvent`.
- **RWF Currency Handling**: Stored as integer units with fixed currency codes, eliminating floating-point rounding errors.
