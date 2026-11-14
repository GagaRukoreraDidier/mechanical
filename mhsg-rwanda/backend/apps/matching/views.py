from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.requests.models import ServiceRequest
from .services import MatchingService
from apps.accounts.permissions import IsAdminUserRole

class MatchingEvaluationView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, request_id):
        req_obj = get_object_or_404(ServiceRequest, id=request_id)
        ranked = MatchingService.rank_providers(req_obj)
        return Response({
            "request_id": str(req_obj.id),
            "category": req_obj.category.name,
            "district": req_obj.district,
            "ranked_providers": ranked,
        })
