# MHSG Rwanda — Centrally Coordinated Demand & Provider Discovery Marketplace

> **Owner:** FIX-IT-FAST CO. Ltd  
> **Strategic Partner:** GAMU (GAMU Global Consultancy)  
> **Platform Name:** MHSG Rwanda (Mechanics, Garages, Spare-Parts Sellers & Home Technicians)  
> **Repository:** [https://github.com/GagaRukoreraDidier/mechanical.git](https://github.com/GagaRukoreraDidier/mechanical.git)

---

## 1. Overview & Platform Blueprint

**MHSG Rwanda** is a centrally coordinated demand and discovery marketplace tailored to Rwanda's automotive and home-services economy. MHSG is strictly an intermediary and coordinator — **not** an inventory owner, repair shop, or logistics operator.

### Core Operating Principles:
1. **Centrally Moderated Requests**: Customers submit detailed requests with approximate location (province/district/sector). Administrator reviews, moderates, and publishes to verified local providers.
2. **Competitive Quotations**: Providers submit formal offers detailing price ranges (RWF), turnaround times, and warranty terms.
3. **Multi-Factor Recommendation Algorithm**: Ranks providers by Capability (25%), Distance/Locality (20%), Availability (15%), Verification (15%), Price (10%), Rating (10%), and Reliability (5%).
4. **Privacy-Preserving Contact Unlocking**: Customer exact contact information (phone number, gate/access directions, exact map pin) remains hidden until customer approval and connection fee payment verification.
5. **Direct Arrangement**: Once unlocked, customer and provider conclude workmanship, delivery, and payment directly.

---

## 2. Tech Stack & Architecture

- **Backend**: Python 3.12+ / Django 5.x, Django REST Framework, Celery, JWT Authentication, Swagger/OpenAPI documentation.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, NextAuth.js.
- **Design System**: Built according to `skills/frontend-design/SKILL.md`:
  - Primary Midnight Black: `#010313`
  - Accent Chrysocolla Blue: `#23A6BD`
  - Typography: Poppins (`@fontsource/poppins`)
  - Clean cards, accessible badges, high-contrast states.

---

## 3. Demo Accounts & Pre-Seeded Credentials

The database comes pre-seeded with rich demo data across all modules (Garages, Mechanics, Spare-Parts Sellers, Home Techs, Emergency Roadside, Service Requests, Quotes, Unlocked Connections, Escrow Payments, and Reviews):

| Role | Email | Password | Description |
|---|---|---|---|
| **Super Admin** | `admin@mhsg.rw` | `Admin@Rwanda2026` | FIX-IT-FAST & GAMU Executive Platform Control |
| **Customer** | `customer@demo.rw` | `Demo@2026` | Jean-Luc Mugisha (Gasabo, Kigali) |
| **Garage** | `garage@demo.rw` | `Garage@2026` | Kigali Auto Works Ltd (Gikondo Industrial) |
| **Mechanic** | `mechanic@demo.rw` | `Mechanic@2026` | Eric Niyonzima Mobile Mechanics |
| **Spare Parts Seller** | `seller@demo.rw` | `Seller@2026` | QuickFix Auto Spares Rwanda |
| **Home Technician** | `tech@demo.rw` | `Tech@2026` | Patrick Habimana (Smart Solar & Home Power) |

*Quick-fill test buttons are also available directly on the `/login` page.*

---

## 4. Quick Start & Execution

### Option A: Using the Convenience Launch Scripts (Windows)
Inside `mhsg-rwanda/`:
- Double click or run `start-backend.bat` to launch Django backend on `http://localhost:8000`.
- Double click or run `start-frontend.bat` to launch Next.js frontend on `http://localhost:3000`.

### Option B: Manual Setup

#### 1. Backend
```bash
cd mhsg-rwanda/backend
python -m venv venv
venv\Scripts\activate   # On Linux/macOS: source venv/bin/activate
pip install -r requirements/base.txt
python manage.py migrate
python manage.py seed_mhsg_data
python manage.py runserver 127.0.0.1:8000
```
- Swagger API Docs: `http://localhost:8000/api/v1/schema/swagger/`
- Django Admin: `http://localhost:8000/admin/`

#### 2. Frontend
```bash
cd mhsg-rwanda/frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 5. Repository Structure
```
MHSG-RWANDA/
├── README.md                                          # Platform documentation & quickstart
├── MHSG_Rwanda_Product_and_Python_Implementation_Guide.docx # Official product specifications
├── skills/                                            # Design & customization specifications
└── mhsg-rwanda/
    ├── backend/                                       # Django REST Framework application
    ├── frontend/                                      # Next.js App Router full-stack client
    ├── docker-compose.yml                             # Container orchestration
    ├── start-backend.bat                              # One-click backend launcher
    └── start-frontend.bat                             # One-click frontend launcher
```

---

## 6. Intellectual Property & Ownership
**FIX-IT-FAST CO. Ltd** & **GAMU Global Consultancy** — All rights reserved.
