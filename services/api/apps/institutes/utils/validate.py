from typing import Any


from apps.institutes.models import Institute

def get_email_domain_list(institute: Institute) -> dict[Any, Any]:
    """Get list of active email domains for an institute"""
    if not institute:
        return []
    domains = institute.get_active_email_domains()
    return {
        domain.domain_type: domain.domain for domain in domains
    }
