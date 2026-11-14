from rest_framework import viewsets, permissions
from .models import RwandaProvince, RwandaDistrict, RwandaSector, RwandaCell, RwandaVillage
from .serializers import (
    RwandaProvinceSerializer,
    RwandaDistrictSerializer,
    RwandaSectorSerializer,
    RwandaCellSerializer,
    RwandaVillageSerializer,
)

class RwandaProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RwandaProvince.objects.prefetch_related("districts").all()
    serializer_class = RwandaProvinceSerializer
    permission_classes = [permissions.AllowAny]

class RwandaDistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RwandaDistrict.objects.all()
    serializer_class = RwandaDistrictSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["province"]

class RwandaSectorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RwandaSector.objects.all()
    serializer_class = RwandaSectorSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["district"]
