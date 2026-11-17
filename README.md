# MHSG Rwanda — Centrally Coordinated Demand & Provider Discovery Marketplace

> **Owner:** FIX-IT-FAST CO. Ltd  
> **Strategic Partner:** GAMU (GAMU Global Consultancy)  
> **Platform Name:** MHSG Rwanda (Mechanics, Garages, Spare-Parts Sellers & Home Technicians)  
> **Repository:** [https://github.com/GagaRukoreraDidier/mechanical.git](https://github.com/GagaRukoreraDidier/mechanical.git)

---

## 1. Overview & Architecture

**MHSG Rwanda** is a centrally coordinated marketplace application connecting vehicle owners and households with verified garages, mobile mechanics, spare parts sellers, and home service technicians across Rwanda.

### Key Highlights:
- **Standalone Embedded Native Database**: Powered by native SQLite (`DatabaseSync`), requiring **no separate backend, no Django, and no database daemon**. The full stack runs self-contained as a unified application.
- **National ID & Telephone Authentication**:
  - Registered users can log in using their **Telephone Number** (e.g. `0788220220`) or **Rwandan National ID Number** (16 digits) as their username.
  - Users can enter their **National ID** or **Telephone Number** as both username and password at the same time to log in immediately.
  - Simple passwords like `123456` and `1234` are also accepted for convenience.
- **Main Platform Administrator**:
  - Email / Username: `admin@mhsg.rw` (or `admin`)
  - Password: `Admin@Rwanda2026` (also accepts `admin123` / `123456`)
- **Branding**: Owned and operated by **FIX-IT-FAST CO. Ltd** in strategic partnership with **GAMU**.

---

## 2. Pre-Seeded Accounts (Instant Testing)

The native database automatically seeds demo accounts, categories, and service requests across Kigali and Rwanda:

| Role | Username (Telephone / National ID / Email) | Password (Fast Access) | Full Name / Description |
|---|---|---|---|
| **Main Admin** | `admin@mhsg.rw` (or `admin`) | `Admin@Rwanda2026` | FIX-IT-FAST Platform Admin |
| **Customer** | `0788220220` or `1199580011223344` | Same as Phone / ID or `1234` | Jean-Luc Mugisha (Gasabo) |
| **Garage** | `0788330330` or `1198880022334455` | Same as Phone / ID or `1234` | Kigali Auto Works Ltd (Gikondo) |
| **Mechanic** | `0788440440` or `1199280033445566` | Same as Phone / ID or `1234` | Eric Niyonzima Mobile Mechanics |
| **Spare Parts** | `0788550550` or `1198580044556677` | Same as Phone / ID or `1234` | QuickFix Auto Spares (Muhima) |
| **Home Tech** | `0788660660` or `1199080055667788` | Same as Phone / ID or `1234` | Patrick Habimana (Smart Solar) |

*The login page at `/login` also features 1-click credential buttons for immediate testing.*

---

## 3. How to Run the Application Immediately

### 1-Click Startup (Windows)
Double-click `start-app.bat` at the root of the project:
```bat
start-app.bat
```
This starts the full-stack server on:
👉 **[http://localhost:3000](http://localhost:3000)**

### Manual Startup
```bash
cd mhsg-rwanda/frontend
npm install
npm run dev
```

---

## 4. Platform Modules
1. **Demand Management**: Customers submit repair/part requests with photos, urgency, and approximate location.
2. **Provider Matching**: Algorithmic decision engine ranks verified local garages, mechanics, and technicians.
3. **Contact Privacy**: Contact numbers and street addresses remain protected until customer approval and connection fee verification.
4. **Interactive Dashboard**: Custom views for Customers, Service Providers, and FIX-IT-FAST Administrators.
5. **In-App Messaging & Reviews**: Direct coordination and verified ratings upon work completion.

---

## 5. Intellectual Property
**FIX-IT-FAST CO. Ltd** (Owner) & **GAMU Global Consultancy** (Strategic Partner).  
All rights reserved © 2026.
