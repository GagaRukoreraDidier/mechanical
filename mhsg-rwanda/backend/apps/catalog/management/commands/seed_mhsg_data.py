from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import uuid

from apps.locations.models import RwandaProvince, RwandaDistrict, RwandaSector
from apps.catalog.models import ServiceCategory
from apps.providers.models import (
    ProviderProfile,
    ProviderLocation,
    ProviderCapability,
    ProviderAvailability,
    VerificationDocument,
)
from apps.requests.models import (
    ServiceRequest,
    CustomerAddress,
    RequestStatusHistory,
    RequestPublication,
    ProviderInvitation,
)
from apps.offers.models import ProviderOffer, ProviderSelection
from apps.connections.models import Connection
from apps.billing.models import Payment, FinancialEvent, FeeConfiguration
from apps.subscriptions.models import SubscriptionPlan, ProviderSubscription
from apps.reviews.models import Review
from apps.messaging.models import Message

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds comprehensive demo data for MHSG Rwanda across all platform modules."

    def handle(self, *args, **options):
        self.stdout.write("====================================================")
        self.stdout.write("Seeding MHSG Rwanda Demo Data (FIX-IT-FAST & GAMU)")
        self.stdout.write("====================================================")

        today = timezone.now().date()
        now = timezone.now()

        # -------------------------------------------------------------------
        # 1. Platform Super Administrator
        # -------------------------------------------------------------------
        admin_user, _ = User.objects.get_or_create(
            email="admin@mhsg.rw",
            defaults={
                "full_name": "FIX-IT-FAST Platform Admin",
                "phone": "+250788100100",
                "role": User.Role.SUPER_ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("Admin@Rwanda2026")
        admin_user.save()
        self.stdout.write(self.style.SUCCESS("[OK] Admin: admin@mhsg.rw / Admin@Rwanda2026"))

        # -------------------------------------------------------------------
        # 2. Rwanda Geography
        # -------------------------------------------------------------------
        provinces = {
            "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
            "Northern Province": ["Musanze", "Gicumbi", "Burera", "Rulindo", "Gakenke"],
            "Western Province": ["Rubavu", "Rusizi", "Karongi"],
            "Southern Province": ["Huye", "Muhanga", "Kamonyi"],
            "Eastern Province": ["Rwamagana", "Bugesera", "Kayonza"],
        }
        for prov_name, districts in provinces.items():
            prov, _ = RwandaProvince.objects.get_or_create(name=prov_name)
            for dist_name in districts:
                RwandaDistrict.objects.get_or_create(province=prov, name=dist_name)

        self.stdout.write(self.style.SUCCESS("[OK] Rwanda Geography (Provinces & Districts)"))

        # -------------------------------------------------------------------
        # 3. Service Categories
        # -------------------------------------------------------------------
        categories_data = [
            {"name": "Engine & Mechanical Repairs", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "engine-mechanical"},
            {"name": "Brakes, Suspension & Steering", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "brakes-suspension"},
            {"name": "Auto Electrical & Diagnostics", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "electrical-diagnostics"},
            {"name": "Transmission & Gearbox", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "transmission-gearbox"},
            {"name": "Tyres, Wheel Alignment & Balancing", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "tyres-alignment"},
            {"name": "Routine Maintenance & Oil Change", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "routine-maintenance"},
            {"name": "Bodywork, Painting & Dent Removal", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "bodywork-painting"},
            {"name": "Air Conditioning & Radiator Cooling", "type": ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE, "slug": "aircon-cooling"},
            # Spare Parts
            {"name": "Brake Discs, Pads & Shoes", "type": ServiceCategory.CategoryType.SPARE_PARTS, "slug": "brake-parts"},
            {"name": "Engine Components & Timing Belts", "type": ServiceCategory.CategoryType.SPARE_PARTS, "slug": "engine-parts"},
            {"name": "Filters, Plugs & Service Parts", "type": ServiceCategory.CategoryType.SPARE_PARTS, "slug": "filters-plugs"},
            {"name": "Batteries, Alternators & Starters", "type": ServiceCategory.CategoryType.SPARE_PARTS, "slug": "batteries-alternators"},
            {"name": "Suspension Bushings & Shock Absorbers", "type": ServiceCategory.CategoryType.SPARE_PARTS, "slug": "suspension-parts"},
            # Home Services
            {"name": "Plumbing & Water Booster Pumps", "type": ServiceCategory.CategoryType.HOME_SERVICE, "slug": "plumbing-pumps"},
            {"name": "Electrical Wiring & Circuit Breakers", "type": ServiceCategory.CategoryType.HOME_SERVICE, "slug": "home-electrical"},
            {"name": "Generators & Solar Inverters", "type": ServiceCategory.CategoryType.HOME_SERVICE, "slug": "generators-solar"},
            {"name": "Air Conditioning & Refrigeration", "type": ServiceCategory.CategoryType.HOME_SERVICE, "slug": "appliances-refrigeration"},
        ]
        cat_map = {}
        for cat in categories_data:
            c, _ = ServiceCategory.objects.get_or_create(
                slug=cat["slug"],
                defaults={"name": cat["name"], "category_type": cat["type"], "is_active": True},
            )
            cat_map[cat["slug"]] = c

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(cat_map)} Service Categories"))

        # -------------------------------------------------------------------
        # 4. Subscription Plans & Fee Configs
        # -------------------------------------------------------------------
        plan_free, _ = SubscriptionPlan.objects.get_or_create(
            name="Free Listing (Pay-as-you-go)",
            defaults={
                "price_rwf": 0,
                "billing_period": SubscriptionPlan.BillingPeriod.MONTHLY,
                "included_connections": 0,
                "discounted_connection_fee_rwf": 2500,
                "features": ["Standard public profile", "Receive matching invites", "Pay standard connection fee per unlock"],
                "is_active": True,
            },
        )
        plan_standard, _ = SubscriptionPlan.objects.get_or_create(
            name="Standard Workshop Plan",
            defaults={
                "price_rwf": 10000,
                "billing_period": SubscriptionPlan.BillingPeriod.MONTHLY,
                "included_connections": 5,
                "discounted_connection_fee_rwf": 1800,
                "features": ["Enhanced workshop profile", "5 included connections/mo", "Discounted overage fee", "Priority ranking"],
                "is_active": True,
            },
        )
        plan_premium, _ = SubscriptionPlan.objects.get_or_create(
            name="Premium Partner Plan",
            defaults={
                "price_rwf": 25000,
                "billing_period": SubscriptionPlan.BillingPeriod.MONTHLY,
                "included_connections": 15,
                "discounted_connection_fee_rwf": 1200,
                "features": ["Top verified badge", "15 included connections/mo", "Lowest overage fee", "Featured in matching", "FIX-IT-FAST Partner Hotline"],
                "is_active": True,
            },
        )

        FeeConfiguration.objects.get_or_create(
            fee_type=FeeConfiguration.FeeType.REQUEST_FEE,
            category=None,
            defaults={
                "amount_rwf": 1000,
                "currency": "RWF",
                "effective_from": today,
                "is_active": True,
                "notes": "Standard customer request activation fee during pilot",
            },
        )
        FeeConfiguration.objects.get_or_create(
            fee_type=FeeConfiguration.FeeType.CONNECTION_FEE,
            category=None,
            defaults={
                "amount_rwf": 2500,
                "currency": "RWF",
                "effective_from": today,
                "is_active": True,
                "notes": "Standard provider connection fee per customer-approved unlock",
            },
        )
        self.stdout.write(self.style.SUCCESS("[OK] Subscription Plans & Fee Configs"))

        # -------------------------------------------------------------------
        # 5. Demo Users & Profiles
        # -------------------------------------------------------------------
        # Customer
        customer_user, _ = User.objects.get_or_create(
            email="customer@demo.rw",
            defaults={
                "full_name": "Jean-Luc Mugisha",
                "phone": "+250788220220",
                "role": User.Role.CUSTOMER,
                "phone_consent": True,
                "address_consent": True,
            },
        )
        customer_user.set_password("Demo@2026")
        customer_user.save()

        cust_addr, _ = CustomerAddress.objects.get_or_create(
            customer=customer_user,
            is_default=True,
            defaults={
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Kimihurura",
                "street_address": "KG 28 Ave, House 14",
                "free_text_directions": "Near Kigali Heights & Convention Centre",
                "latitude": -1.9536,
                "longitude": 30.0924,
                "phone_consent": True,
                "address_consent": True,
            },
        )

        # Garage Provider
        garage_user, _ = User.objects.get_or_create(
            email="garage@demo.rw",
            defaults={
                "full_name": "Kigali Premier Auto Garage",
                "phone": "+250788330330",
                "role": User.Role.GARAGE,
            },
        )
        garage_user.set_password("Demo@2026")
        garage_user.save()

        garage_profile, _ = ProviderProfile.objects.get_or_create(
            user=garage_user,
            defaults={
                "display_name": "Kigali Premier Auto Works (FIX-IT-FAST Certified)",
                "description": "Full-service automotive workshop in Gikondo Industrial Park. State-of-the-art diagnostic scanners, 4 hydraulic lifts, certified master technicians.",
                "provider_types": ["GARAGE"],
                "verification_status": ProviderProfile.VerificationStatus.CERTIFIED,
                "rating_average": 4.9,
                "rating_count": 28,
                "is_active": True,
            },
        )
        ProviderLocation.objects.get_or_create(
            provider=garage_profile,
            is_primary=True,
            defaults={
                "province": "Kigali City",
                "district": "Kicukiro",
                "sector": "Gikondo",
                "street_address": "KK 15 Rd, Gikondo Industrial Zone",
                "service_radius_km": 25.0,
                "latitude": -1.9782,
                "longitude": 30.0765,
            },
        )
        ProviderCapability.objects.get_or_create(
            provider=garage_profile,
            category=cat_map["engine-mechanical"],
            defaults={"vehicle_brands": ["Toyota", "Mercedes-Benz", "Nissan", "Land Rover", "BMW"], "specialty": "Heavy mechanical & overhaul"},
        )
        ProviderCapability.objects.get_or_create(
            provider=garage_profile,
            category=cat_map["brakes-suspension"],
            defaults={"vehicle_brands": ["Toyota", "Nissan", "Mitsubishi", "Hyundai"], "specialty": "Hydraulic braking & 4x4 suspension"},
        )
        ProviderSubscription.objects.get_or_create(
            provider=garage_profile,
            status=ProviderSubscription.Status.ACTIVE,
            defaults={
                "plan": plan_premium,
                "start_date": today - timedelta(days=10),
                "end_date": today + timedelta(days=20),
                "included_credits_used": 3,
            },
        )

        # Independent Mechanic
        mechanic_user, _ = User.objects.get_or_create(
            email="mechanic@demo.rw",
            defaults={
                "full_name": "Emmanuel Nsengimana",
                "phone": "+250788440440",
                "role": User.Role.MECHANIC,
            },
        )
        mechanic_user.set_password("Demo@2026")
        mechanic_user.save()

        mechanic_profile, _ = ProviderProfile.objects.get_or_create(
            user=mechanic_user,
            defaults={
                "display_name": "Emmanuel Mobile Diagnostics & Auto Tech",
                "description": "Mobile certified automotive technician with mobile service van. Electronic fault finding, alternator, starter motor, on-site breakdown assistance.",
                "provider_types": ["MECHANIC"],
                "verification_status": ProviderProfile.VerificationStatus.DOCS_REVIEWED,
                "rating_average": 4.8,
                "rating_count": 19,
                "is_active": True,
            },
        )
        ProviderLocation.objects.get_or_create(
            provider=mechanic_profile,
            is_primary=True,
            defaults={
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Remera",
                "street_address": "KG 11 Ave, Remera",
                "service_radius_km": 30.0,
                "latitude": -1.9610,
                "longitude": 30.1120,
            },
        )
        ProviderCapability.objects.get_or_create(
            provider=mechanic_profile,
            category=cat_map["electrical-diagnostics"],
            defaults={"vehicle_brands": ["Toyota", "Ford", "Nissan", "Kia"], "specialty": "Computer diagnostics & wiring harness"},
        )

        # Spare Parts Seller
        seller_user, _ = User.objects.get_or_create(
            email="seller@demo.rw",
            defaults={
                "full_name": "Nyabugogo Genuine Auto Parts Ltd",
                "phone": "+250788550550",
                "role": User.Role.SELLER,
            },
        )
        seller_user.set_password("Demo@2026")
        seller_user.save()

        seller_profile, _ = ProviderProfile.objects.get_or_create(
            user=seller_user,
            defaults={
                "display_name": "Nyabugogo Auto Spares & Japanese Parts Importer",
                "description": "Direct importer of genuine Japanese OEM and tier-1 aftermarket spare parts for Toyota, Nissan, Mitsubishi and Isuzu.",
                "provider_types": ["SELLER"],
                "verification_status": ProviderProfile.VerificationStatus.BUSINESS_CHECKED,
                "rating_average": 4.7,
                "rating_count": 42,
                "is_active": True,
            },
        )
        ProviderLocation.objects.get_or_create(
            provider=seller_profile,
            is_primary=True,
            defaults={
                "province": "Kigali City",
                "district": "Nyarugenge",
                "sector": "Muhima",
                "street_address": "KN 1 Rd, Nyabugogo Commercial Center",
                "service_radius_km": 40.0,
                "latitude": -1.9390,
                "longitude": 30.0450,
            },
        )
        ProviderCapability.objects.get_or_create(
            provider=seller_profile,
            category=cat_map["brake-parts"],
            defaults={"vehicle_brands": ["Toyota", "Nissan", "Mitsubishi"], "specialty": "OEM brake pads, rotors, drums"},
        )

        # Home Technician
        tech_user, _ = User.objects.get_or_create(
            email="tech@demo.rw",
            defaults={
                "full_name": "Patrick Habimana",
                "phone": "+250788660660",
                "role": User.Role.HOME_TECH,
            },
        )
        tech_user.set_password("Demo@2026")
        tech_user.save()

        tech_profile, _ = ProviderProfile.objects.get_or_create(
            user=tech_user,
            defaults={
                "display_name": "Patrick Smart Solar & Electrical Solutions",
                "description": "Licensed residential and commercial electrician. Solar hybrid inverters, backup lithium battery banks, domestic wiring & pump controllers.",
                "provider_types": ["HOME_TECH"],
                "verification_status": ProviderProfile.VerificationStatus.DOCS_REVIEWED,
                "rating_average": 5.0,
                "rating_count": 14,
                "is_active": True,
            },
        )
        ProviderLocation.objects.get_or_create(
            provider=tech_profile,
            is_primary=True,
            defaults={
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Kacyiru",
                "street_address": "KG 7 Ave, Kacyiru",
                "service_radius_km": 20.0,
                "latitude": -1.9420,
                "longitude": 30.0810,
            },
        )
        self.stdout.write(self.style.SUCCESS("[OK] Seeded 5 Verified Provider Profiles & Locations"))

        # -------------------------------------------------------------------
        # 6. Service Requests Lifecycle Demo
        # -------------------------------------------------------------------
        # Request 1: RAV4 Brakes -> Status: PUBLISHED (Ready for offers)
        req1, _ = ServiceRequest.objects.get_or_create(
            description="Toyota RAV4 2018 front brake pads grinding noise and vibration during high-speed deceleration. Need genuine ceramic or OEM brake pads replacement and rotor inspection.",
            defaults={
                "customer": customer_user,
                "category": cat_map["brakes-suspension"],
                "protected_address_ref": cust_addr,
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Kimihurura",
                "approximate_location": "Kimihurura, Gasabo",
                "vehicle_make": "Toyota",
                "vehicle_model": "RAV4",
                "vehicle_year": "2018",
                "vehicle_engine": "2.5L Dual VVT-i Petrol",
                "mileage": "68,400 km",
                "urgency": ServiceRequest.Urgency.STANDARD,
                "status": ServiceRequest.Status.PUBLISHED,
                "fee_status": ServiceRequest.FeeStatus.SUCCEEDED,
                "submitted_at": now - timedelta(hours=5),
                "published_at": now - timedelta(hours=3),
            },
        )
        pub1, _ = RequestPublication.objects.get_or_create(
            request=req1,
            defaults={"published_by": admin_user},
        )
        ProviderInvitation.objects.get_or_create(publication=pub1, provider=garage_profile)
        ProviderInvitation.objects.get_or_create(publication=pub1, provider=mechanic_profile)

        # Request 2: Mercedes Transmission -> Status: OFFERS_RECEIVED (with 2 offers)
        req2, _ = ServiceRequest.objects.get_or_create(
            description="Mercedes-Benz C200 (W205) harsh shifting from 2nd to 3rd gear when engine reaches operating temperature. Need diagnostic scan and valve body / fluid inspection.",
            defaults={
                "customer": customer_user,
                "category": cat_map["transmission-gearbox"],
                "protected_address_ref": cust_addr,
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Kimihurura",
                "approximate_location": "Gasabo District",
                "vehicle_make": "Mercedes-Benz",
                "vehicle_model": "C200 (W205)",
                "vehicle_year": "2016",
                "vehicle_engine": "2.0L Turbo 9G-Tronic",
                "mileage": "94,200 km",
                "urgency": ServiceRequest.Urgency.URGENT,
                "status": ServiceRequest.Status.OFFERS_RECEIVED,
                "fee_status": ServiceRequest.FeeStatus.SUCCEEDED,
                "submitted_at": now - timedelta(days=1),
                "published_at": now - timedelta(hours=18),
            },
        )
        # Offer 1: Garage
        offer1, _ = ProviderOffer.objects.get_or_create(
            request=req2,
            provider=garage_profile,
            defaults={
                "price_min_rwf": 120000,
                "price_max_rwf": 160000,
                "currency": "RWF",
                "scope": "Star Diagnostic scan, adaptation reset, ATF fluid level and quality check, electronic valve body test. Includes workshop hydraulic lift inspection.",
                "availability": "Available immediately tomorrow at 8:30 AM",
                "estimated_lead_time": "1 working day (6 hours)",
                "warranty_terms": "3 months warranty on workmanship and diagnostic accuracy",
                "status": ProviderOffer.Status.SUBMITTED,
            },
        )
        # Offer 2: Mechanic
        offer2, _ = ProviderOffer.objects.get_or_create(
            request=req2,
            provider=mechanic_profile,
            defaults={
                "price_min_rwf": 85000,
                "price_max_rwf": 110000,
                "currency": "RWF",
                "scope": "Mobile diagnostic scan at customer location, live transmission parameter logging, error code clearing and fluid dipstick inspection.",
                "availability": "Can arrive at your location today at 3:00 PM",
                "estimated_lead_time": "3 hours on-site",
                "warranty_terms": "Comprehensive diagnostic report provided with repair roadmap",
                "status": ProviderOffer.Status.SUBMITTED,
            },
        )

        # Request 3: Hilux Alternator -> Status: AWAITING_CUSTOMER_APPROVAL
        req3, _ = ServiceRequest.objects.get_or_create(
            description="Toyota Hilux D-4D battery warning light illuminated on dashboard. Battery drained overnight. Need alternator diode testing and replacement if faulty.",
            defaults={
                "customer": customer_user,
                "category": cat_map["electrical-diagnostics"],
                "protected_address_ref": cust_addr,
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Kimihurura",
                "approximate_location": "Gasabo District",
                "vehicle_make": "Toyota",
                "vehicle_model": "Hilux D-4D Double Cabin",
                "vehicle_year": "2020",
                "vehicle_engine": "2.8L GD-6 Turbo Diesel",
                "mileage": "112,000 km",
                "urgency": ServiceRequest.Urgency.EMERGENCY,
                "status": ServiceRequest.Status.AWAITING_CUSTOMER_APPROVAL,
                "fee_status": ServiceRequest.FeeStatus.SUCCEEDED,
                "submitted_at": now - timedelta(days=2),
                "published_at": now - timedelta(days=1, hours=20),
            },
        )
        offer3, _ = ProviderOffer.objects.get_or_create(
            request=req3,
            provider=mechanic_profile,
            defaults={
                "price_min_rwf": 95000,
                "price_max_rwf": 140000,
                "currency": "RWF",
                "scope": "Emergency on-site alternator testing. If diode pack is burnt, supply and install genuine Denso replacement alternator + belt tensioning.",
                "availability": "Mobile van ready to deploy within 45 minutes",
                "estimated_lead_time": "2 hours on-site",
                "warranty_terms": "6 months warranty on Denso alternator unit",
                "status": ProviderOffer.Status.SELECTED,
            },
        )
        ProviderSelection.objects.get_or_create(
            request=req3,
            selected_offer=offer3,
            defaults={
                "admin": admin_user,
                "rationale": "Emmanuel has high mobile responsiveness (45 mins deploy time), genuine Denso part availability and 6 months warranty.",
                "customer_decision": ProviderSelection.CustomerDecision.PENDING,
            },
        )

        # Request 4: Nissan Patrol -> Status: CONNECTED (Contact details unlocked!)
        req4, _ = ServiceRequest.objects.get_or_create(
            description="Nissan Patrol Y61 4x4 heavy knocking in steering rack and worn front suspension control arm bushings. Need genuine polyurethane bushings and complete front-end alignment.",
            defaults={
                "customer": customer_user,
                "category": cat_map["brakes-suspension"],
                "protected_address_ref": cust_addr,
                "province": "Kigali City",
                "district": "Kicukiro",
                "sector": "Gikondo",
                "approximate_location": "Gikondo, Kicukiro",
                "vehicle_make": "Nissan",
                "vehicle_model": "Patrol Y61 GRX",
                "vehicle_year": "2015",
                "vehicle_engine": "4.2L TD42 Diesel",
                "mileage": "178,000 km",
                "urgency": ServiceRequest.Urgency.STANDARD,
                "status": ServiceRequest.Status.CONNECTED,
                "fee_status": ServiceRequest.FeeStatus.SUCCEEDED,
                "submitted_at": now - timedelta(days=4),
                "published_at": now - timedelta(days=3),
            },
        )
        offer4, _ = ProviderOffer.objects.get_or_create(
            request=req4,
            provider=garage_profile,
            defaults={
                "price_min_rwf": 280000,
                "price_max_rwf": 340000,
                "currency": "RWF",
                "scope": "Complete replacement of all 8 control arm polyurethane bushings, steering damper replacement, 3D computerized wheel alignment.",
                "availability": "Workshop bay reserved for Wednesday 8:00 AM",
                "estimated_lead_time": "1 working day",
                "warranty_terms": "12 months warranty on heavy-duty suspension components",
                "status": ProviderOffer.Status.SELECTED,
            },
        )
        conn4, _ = Connection.objects.get_or_create(
            request=req4,
            defaults={
                "provider": garage_profile,
                "connection_status": Connection.Status.ACTIVE,
                "outcome": Connection.Outcome.CONNECTED,
                "unlocked_at": now - timedelta(days=2),
                "unlocked_fields": {
                    "customer_name": customer_user.full_name,
                    "customer_phone": str(customer_user.phone),
                    "customer_address": f"{cust_addr.street_address}, {cust_addr.sector}, {cust_addr.district}",
                    "access_instructions": cust_addr.free_text_directions,
                },
            },
        )

        # Request 5: Home Solar Setup -> Status: COMPLETED (with 5-star review)
        req5, _ = ServiceRequest.objects.get_or_create(
            description="Supply and install 5kVA Hybrid Solar Inverter with 5.12kWh Lithium-ion LiFePO4 battery storage bank for residential backup during grid outages.",
            defaults={
                "customer": customer_user,
                "category": cat_map["generators-solar"],
                "protected_address_ref": cust_addr,
                "province": "Kigali City",
                "district": "Gasabo",
                "sector": "Kimihurura",
                "approximate_location": "Kimihurura, Gasabo",
                "asset_type": "Residential Villa (3-phase supply)",
                "urgency": ServiceRequest.Urgency.STANDARD,
                "status": ServiceRequest.Status.COMPLETED,
                "fee_status": ServiceRequest.FeeStatus.SUCCEEDED,
                "submitted_at": now - timedelta(days=14),
                "published_at": now - timedelta(days=13),
            },
        )
        offer5, _ = ProviderOffer.objects.get_or_create(
            request=req5,
            provider=tech_profile,
            defaults={
                "price_min_rwf": 2600000,
                "price_max_rwf": 2900000,
                "currency": "RWF",
                "scope": "Deye 5kW Hybrid Inverter + Felicity 5.12kWh Lithium battery bank, surge protection box, automatic transfer switch (ATS), installation & commissioning.",
                "availability": "Ready to install within 48 hours",
                "estimated_lead_time": "2 days installation",
                "warranty_terms": "5 years manufacturer warranty on inverter and battery cells",
                "status": ProviderOffer.Status.SELECTED,
            },
        )
        conn5, _ = Connection.objects.get_or_create(
            request=req5,
            defaults={
                "provider": tech_profile,
                "connection_status": Connection.Status.ACTIVE,
                "outcome": Connection.Outcome.COMPLETED,
                "unlocked_at": now - timedelta(days=12),
                "unlocked_fields": {
                    "customer_name": customer_user.full_name,
                    "customer_phone": str(customer_user.phone),
                    "customer_address": f"{cust_addr.street_address}, {cust_addr.sector}",
                },
            },
        )
        Review.objects.get_or_create(
            connection=conn5,
            defaults={
                "reviewer": customer_user,
                "provider": tech_profile,
                "rating": 5,
                "comment": "Outstanding installation by Patrick Habimana (Smart Solar). Clean wiring, ATS works seamlessly without any flicker when REG power cuts. Highly recommended!",
                "moderation_status": Review.ModerationStatus.APPROVED,
            },
        )

        self.stdout.write(self.style.SUCCESS("[OK] Seeded 5 Active & Completed Service Requests"))

        # -------------------------------------------------------------------
        # 7. Seed Billing Payments & Financial Ledger
        # -------------------------------------------------------------------
        Payment.objects.get_or_create(
            idempotency_key="IDEMP-REQ-001",
            defaults={
                "payer": customer_user,
                "purpose": Payment.Purpose.REQUEST_FEE,
                "related_object_type": "service_request",
                "related_object_id": req1.id,
                "amount_rwf": 1000,
                "payment_provider": Payment.Provider.SANDBOX,
                "status": Payment.Status.SUCCEEDED,
                "succeeded_at": now - timedelta(hours=5),
            },
        )
        Payment.objects.get_or_create(
            idempotency_key="IDEMP-CONN-004",
            defaults={
                "payer": garage_user,
                "purpose": Payment.Purpose.CONNECTION_FEE,
                "related_object_type": "connection",
                "related_object_id": conn4.id,
                "amount_rwf": 2500,
                "payment_provider": Payment.Provider.SANDBOX,
                "status": Payment.Status.SUCCEEDED,
                "succeeded_at": now - timedelta(days=2),
            },
        )
        Payment.objects.get_or_create(
            idempotency_key="IDEMP-SUB-GARAGE",
            defaults={
                "payer": garage_user,
                "purpose": Payment.Purpose.PROVIDER_SUBSCRIPTION,
                "related_object_type": "provider_subscription",
                "related_object_id": garage_profile.id,
                "amount_rwf": 25000,
                "payment_provider": Payment.Provider.SANDBOX,
                "status": Payment.Status.SUCCEEDED,
                "succeeded_at": now - timedelta(days=10),
            },
        )
        self.stdout.write(self.style.SUCCESS("[OK] Seeded Payments & Financial Ledger Entries"))

        # -------------------------------------------------------------------
        # 8. Seed In-App Messages
        # -------------------------------------------------------------------
        Message.objects.get_or_create(
            connection=conn4,
            sender=admin_user,
            recipient=customer_user,
            defaults={
                "content": "Hello Jean-Luc, your service request for suspension overhaul has been matched with Kigali Auto Works Ltd.",
                "read_at": now - timedelta(days=1),
            },
        )
        Message.objects.get_or_create(
            connection=conn4,
            sender=customer_user,
            recipient=garage_user,
            defaults={
                "content": "Good day! I have dropped off the vehicle at your bay in Gikondo.",
                "read_at": now - timedelta(hours=12),
            },
        )
        Message.objects.get_or_create(
            connection=conn5,
            sender=tech_profile.user,
            recipient=customer_user,
            defaults={
                "content": "Solar system commissioning is complete. Battery testing passes all factory specs.",
                "read_at": now - timedelta(days=11),
            },
        )
        self.stdout.write(self.style.SUCCESS("[OK] Seeded Communications & Notification Messages"))

        self.stdout.write(self.style.SUCCESS("\n===================================================="))
        self.stdout.write(self.style.SUCCESS("All MHSG Rwanda Demo Modules Successfully Populated!"))
        self.stdout.write(self.style.SUCCESS("Owned by FIX-IT-FAST CO. Ltd & GAMU"))
        self.stdout.write(self.style.SUCCESS("===================================================="))
