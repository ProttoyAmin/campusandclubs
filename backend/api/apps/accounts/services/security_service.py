import hashlib
import secrets
from dataclasses import asdict, dataclass
from allauth.core.internal.httpkit import get_client_ip   # honors ALLAUTH_TRUSTED_PROXY_COUNT
from core.services import BaseService
from rest_framework.request import Request
from django.http import HttpRequest
from ..models import User, LoginRecord
from ..repositories.login_record_repository import LoginRecordRepository
from user_agents import parse


DEVICE_COOKIE = "device_id"
DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
ALERT_ON_NEW_IP = True      # flip to False if it gets noisy


@dataclass(frozen=True)
class DeviceInfo:
    browser: str
    browser_version: str

    os: str
    os_version: str
    
    device_family: str
    device_model: str
    device_brand: str
    device_type: LoginRecord.DeviceType

    is_bot: bool
    is_touch_capable: bool
    is_email_client: bool

@dataclass(frozen=True)
class LoginCheck:
    new_device: bool
    new_ip: bool
    first_login: bool
    ip: str | None
    user_agent: str

    @property
    def should_alert(self) -> bool:
        return not self.first_login and (self.new_device or (ALERT_ON_NEW_IP and self.new_ip))

@dataclass(frozen=True, slots=True)
class RecordResult:
    check: LoginCheck
    device: DeviceInfo

def get_device_information(user_agent_string: str) -> DeviceInfo:
    ua = parse(user_agent_string)

    if ua.is_bot:
        device_type = LoginRecord.DeviceType.BOT
    elif ua.is_tablet:
        device_type = LoginRecord.DeviceType.TABLET
    elif ua.is_mobile:
        device_type = LoginRecord.DeviceType.MOBILE
    elif ua.is_pc:
        device_type = LoginRecord.DeviceType.DESKTOP
    else:
        device_type = LoginRecord.DeviceType.OTHER

    return DeviceInfo(
        browser=ua.browser.family or "",
        browser_version=ua.browser.version_string or "",
        os=ua.os.family or "",
        os_version=ua.os.version_string or "",
        device_family=ua.device.family or "",
        device_brand=ua.device.brand or "",
        device_model=ua.device.model or "",
        device_type=device_type,
        is_bot=ua.is_bot,
        is_touch_capable=ua.is_touch_capable,
        is_email_client=ua.is_email_client
    )

class SecurityService(BaseService[User, LoginRecordRepository]):
    repository_class = LoginRecordRepository


    def record(self, request: HttpRequest, user: User) -> RecordResult:
        token = getattr(request, "_device_token", None)

        if not token:
            raise ValueError("Device token missing. Ensure DeviceCookieMiddleware is registered.")

        device_hash = hashlib.sha256(token.encode()).hexdigest()
        ip = get_client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")[:512]

        records = self.get_repository().filter(user=user)

        first_login = not records.exists()
        new_device = not records.filter(device_hash=device_hash).exists()

        new_ip = (
            ip is not None and not records.filter(ip_address=ip).exists()
        )

        check = LoginCheck(
            first_login=first_login,
            new_device=new_device,
            new_ip=new_ip,
            ip=ip,
            user_agent=ua
        )

        device_info = get_device_information(user_agent_string=ua)
        self.get_repository().create(
            user=user,
            device_hash=device_hash,
            ip_address=ip,
            user_agent=ua,
            **asdict(device_info)
        )

        return RecordResult(check=check, device=device_info)




