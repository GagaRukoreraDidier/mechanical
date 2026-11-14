from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum
from apps.requests.models import ServiceRequest
from apps.providers.models import ProviderProfile
from apps.connections.models import Connection
from apps.billing.models import Payment
from apps.accounts.permissions import IsAdminUserRole

class DashboardAnalyticsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        # Requests summary
        total_requests = ServiceRequest.objects.count()
        under_review = ServiceRequest.objects.filter(status=ServiceRequest.Status.UNDER_REVIEW).count()
        published = ServiceRequest.objects.filter(status=ServiceRequest.Status.PUBLISHED).count()
        completed = ServiceRequest.objects.filter(status=ServiceRequest.Status.COMPLETED).count()

        # Status breakdown
        status_counts = list(
            ServiceRequest.objects.values("status").annotate(count=Count("id")).order_by("-count")
        )

        # Provider summary
        total_providers = ProviderProfile.objects.count()
        active_providers = ProviderProfile.objects.filter(is_active=True, is_suspended=False).count()
        unverified_providers = ProviderProfile.objects.filter(verification_status=ProviderProfile.VerificationStatus.UNVERIFIED).count()

        # Connections
        total_connections = Connection.objects.count()
        unlocked_connections = Connection.objects.filter(connection_status=Connection.Status.ACTIVE).count()

        # Revenue (RWF)
        revenue_stats = Payment.objects.filter(status=Payment.Status.SUCCEEDED).aggregate(
            total_revenue=Sum("amount_rwf")
        )
        total_revenue_rwf = revenue_stats["total_revenue"] or 0

        # Revenue by purpose
        revenue_by_purpose = list(
            Payment.objects.filter(status=Payment.Status.SUCCEEDED)
            .values("purpose")
            .annotate(total=Sum("amount_rwf"), count=Count("id"))
        )

        # District breakdown
        district_counts = list(
            ServiceRequest.objects.values("district")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        return Response({
            "metrics": {
                "total_requests": total_requests,
                "under_review_requests": under_review,
                "published_requests": published,
                "completed_requests": completed,
                "total_providers": total_providers,
                "active_providers": active_providers,
                "unverified_providers": unverified_providers,
                "total_connections": total_connections,
                "unlocked_connections": unlocked_connections,
                "total_revenue_rwf": total_revenue_rwf,
            },
            "status_breakdown": status_counts,
            "revenue_by_purpose": revenue_by_purpose,
            "top_districts": district_counts,
        })
