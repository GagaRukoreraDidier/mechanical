"""Root URL configuration for MHSG Rwanda."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

api_v1_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("requests/", include("apps.requests.urls")),
    path("providers/", include("apps.providers.urls")),
    path("offers/", include("apps.offers.urls")),
    path("connections/", include("apps.connections.urls")),
    path("billing/", include("apps.billing.urls")),
    path("subscriptions/", include("apps.subscriptions.urls")),
    path("messaging/", include("apps.messaging.urls")),
    path("catalog/", include("apps.catalog.urls")),
    path("reviews/", include("apps.reviews.urls")),
    path("matching/", include("apps.matching.urls")),
    path("moderation/", include("apps.moderation.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("admin-panel/", include("apps.analytics.urls")),
    path("locations/", include("apps.locations.urls")),
    path("audit/", include("apps.audit.urls")),
    # OpenAPI schema
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("schema/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
