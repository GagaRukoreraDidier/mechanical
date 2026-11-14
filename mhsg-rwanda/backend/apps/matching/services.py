from decimal import Decimal
from django.db.models import Q
from apps.providers.models import ProviderProfile, ProviderLocation
from apps.requests.models import ServiceRequest
from apps.offers.models import ProviderOffer

class MatchingService:
    DEFAULT_WEIGHTS = {
        "capability": 25,
        "distance": 20,
        "availability": 15,
        "verification": 15,
        "price": 10,
        "rating": 10,
        "reliability": 5,
    }

    @classmethod
    def get_eligible_providers(cls, request_obj: ServiceRequest):
        """
        Filters providers who are active, not suspended, operate in the request area
        and possess matching capabilities or product listings.
        """
        qs = ProviderProfile.objects.filter(
            is_active=True,
            is_suspended=False,
        ).prefetch_related("locations", "capabilities", "availabilities")

        # District / location filter
        if request_obj.district:
            qs = qs.filter(
                Q(locations__district__iexact=request_obj.district) |
                Q(locations__province__iexact=request_obj.province)
            )

        # Category capability match
        if request_obj.category:
            qs = qs.filter(
                Q(capabilities__category=request_obj.category) |
                Q(products__category=request_obj.category) |
                Q(services__category=request_obj.category)
            )

        return qs.distinct()

    @classmethod
    def rank_providers(cls, request_obj: ServiceRequest, providers=None, custom_weights=None):
        """
        Ranks eligible providers according to weighted criteria and outputs component scores and explanations.
        """
        if providers is None:
            providers = cls.get_eligible_providers(request_obj)

        weights = custom_weights or cls.DEFAULT_WEIGHTS
        ranked = []

        # Find existing offers for this request to evaluate price competitiveness
        offers_by_provider = {
            offer.provider_id: offer
            for offer in ProviderOffer.objects.filter(request=request_obj)
        }

        min_offered_price = None
        prices = [
            o.price_min_rwf for o in offers_by_provider.values() if o.price_min_rwf is not None
        ]
        if prices:
            min_offered_price = min(prices)

        for provider in providers:
            breakdown = {}
            reasons = []

            # 1. Capability Fit (max 25)
            cap_score = 0
            matching_caps = [
                c for c in provider.capabilities.all()
                if c.category_id == request_obj.category_id
            ]
            if matching_caps:
                cap_score = 15
                reasons.append(f"Direct category capability: {request_obj.category.name}")
                # Bonus if vehicle brand or system matches
                for cap in matching_caps:
                    if request_obj.vehicle_make and request_obj.vehicle_make.lower() in [
                        b.lower() for b in cap.vehicle_brands
                    ]:
                        cap_score = 25
                        reasons.append(f"Specialized in {request_obj.vehicle_make} vehicles")
                        break
            else:
                cap_score = 10
            breakdown["capability"] = cap_score

            # 2. Distance / Locality (max 20)
            dist_score = 10
            locs = list(provider.locations.all())
            matching_district = any(
                l.district.lower() == request_obj.district.lower() for l in locs
            )
            matching_sector = any(
                request_obj.sector and l.sector.lower() == request_obj.sector.lower()
                for l in locs
            )
            if matching_sector:
                dist_score = 20
                reasons.append(f"Located in same sector: {request_obj.sector}")
            elif matching_district:
                dist_score = 16
                reasons.append(f"Located in same district: {request_obj.district}")
            else:
                dist_score = 8
            breakdown["distance"] = dist_score

            # 3. Availability (max 15)
            avail_score = 12
            reasons.append("Standard operating availability")
            breakdown["availability"] = avail_score

            # 4. Verification Status (max 15)
            verif_map = {
                ProviderProfile.VerificationStatus.CERTIFIED: (15, "Independently certified provider"),
                ProviderProfile.VerificationStatus.DOCS_REVIEWED: (13, "Documents verified by MHSG"),
                ProviderProfile.VerificationStatus.BUSINESS_CHECKED: (10, "RDB Business registration checked"),
                ProviderProfile.VerificationStatus.IDENTITY_CHECKED: (8, "National ID verified"),
                ProviderProfile.VerificationStatus.UNVERIFIED: (2, "Standard unverified profile"),
            }
            v_score, v_reason = verif_map.get(
                provider.verification_status, (5, "Basic profile")
            )
            breakdown["verification"] = v_score
            reasons.append(v_reason)

            # 5. Price Competitiveness (max 10)
            offer = offers_by_provider.get(provider.id)
            price_score = 5
            if offer and offer.price_min_rwf:
                if min_offered_price and offer.price_min_rwf == min_offered_price:
                    price_score = 10
                    reasons.append(f"Most competitive quote: RWF {offer.price_min_rwf:,}")
                else:
                    price_score = 7
                    reasons.append(f"Quoted: RWF {offer.price_min_rwf:,}")
            breakdown["price"] = price_score

            # 6. Rating (max 10)
            rating_score = int(float(provider.rating_average) * 2) if provider.rating_average else 5
            breakdown["rating"] = min(10, rating_score)
            if provider.rating_count > 0:
                reasons.append(f"Rated {provider.rating_average} ★ ({provider.rating_count} reviews)")

            # 7. Response Reliability (max 5)
            rel_score = 5
            breakdown["reliability"] = rel_score

            total_score = sum(breakdown.values())

            ranked.append({
                "provider_id": str(provider.id),
                "display_name": provider.display_name,
                "verification_status": provider.verification_status,
                "rating_average": float(provider.rating_average),
                "rating_count": provider.rating_count,
                "total_score": total_score,
                "score_breakdown": breakdown,
                "reasons": reasons,
                "offer_id": str(offer.id) if offer else None,
                "quoted_price_rwf": offer.price_min_rwf if offer else None,
            })

        # Sort descending by total score
        ranked.sort(key=lambda x: x["total_score"], reverse=True)
        return ranked
