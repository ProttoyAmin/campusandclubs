from django.urls import path, re_path, include

from apps.institutes.views.generics import (
    InstituteListCreateView,
    InstituteDetailUpdateDeleteView,
    AffiliateClaimView,
    AffiliationStatusView,
    AffiliationRetreiveUpdateDeleteView,
    VerifyAffiliationView
)

urlpatterns = [
    path('', InstituteListCreateView.as_view(), name='institute_list'),
    path('<uuid:pk>/', InstituteDetailUpdateDeleteView.as_view(),
         name='institute_info'),
    path('claim/', AffiliateClaimView.as_view(), name='claim_affiliation'),
    path('affiliations/',
         AffiliationStatusView.as_view(), name='affiliations'),
    path('affiliations/<int:pk>/',
         AffiliationRetreiveUpdateDeleteView.as_view(), name='affiliation'),
    path('affiliations/<int:pk>/verify/',
         VerifyAffiliationView.as_view(), name='verify_affiliation')
]
