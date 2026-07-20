from django.urls import path, re_path, include

from apps.institutes.views.generics import (
    InstituteListCreateView,
    InstituteDetailUpdateDeleteView
)

urlpatterns = [
    path('', InstituteListCreateView.as_view(), name='institute_list'),
    path('<uuid:pk>/', InstituteDetailUpdateDeleteView.as_view(), name='institute_info'),
]