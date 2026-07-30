from typing import Any
import uuid

from django.db.models import QuerySet


from apps.institutes.models import Institute, InstituteEmailDomain


def get_email_domain_list(institute_id: uuid.UUID) -> dict[Any, Any]:
    """Get list of active email domains for an institute"""
    institute = Institute.objects.filter(id=institute_id).first()
    if not institute:
        return {}
    domains: QuerySet[InstituteEmailDomain] = institute.get_active_email_domains
    domain_map = {}
    for domain in domains:
        domain_map[domain.domain_type] = domain.domain
    return domain_map
    # return {
    #     domain.domain_type: domain.domain_type for domain in domains
    # }
