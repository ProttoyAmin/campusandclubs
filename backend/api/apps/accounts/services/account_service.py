from allauth.account.adapter import get_adapter
from allauth.account.forms import SignupForm
from allauth.account.internal.flows import signup as signup_flow
from allauth.core.exceptions import ImmediateHttpResponse
from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from core.services import BaseService

