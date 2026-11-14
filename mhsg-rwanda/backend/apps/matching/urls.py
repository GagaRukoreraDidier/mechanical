from django.urls import path
from .views import MatchingEvaluationView

urlpatterns = [
    path("<uuid:request_id>/", MatchingEvaluationView.as_view(), name="matching-evaluation"),
]
