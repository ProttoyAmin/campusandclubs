"""Authentication views that delegate *directly* to django-allauth headless
views so they live under /api/v1/accounts/auth/* (our own namespace) while
using allauth's internal flows (session login, signup, logout) 1:1.

Why a thin wrapper instead of ``include('allauth.headless.urls')``:
  * Our URLs, our namespace — one API surface (``/api/v1/...``).
  * We can swap the underlying mechanism later without changing frontend URLs.
  * We keep cookie/session behaviors explicit and debuggable.

The views are intentionally simple: they hand the request straight to the
allauth class-based view built for the BROWSER client (session-cookie auth,
which is what ``HEADLESS_CLIENTS`` includes). If we ever switch to an
app/JWT client we just change ``Client.BROWSER`` → ``Client.APP`` here.
"""
from __future__ import annotations