from .institute_serializers import InstituteSerializer, InstituteDetailSerializer
from .affiliates import ClaimAffiliateSerializer, InstituteAffiliateSerializer, VerifyAffiliateSerializer

__all__ = [
    'InstituteSerializer',
    'InstituteDetailSerializer',

    'ClaimAffiliateSerializer',
    'InstituteAffiliateSerializer',
    'VerifyAffiliateSerializer'
]
