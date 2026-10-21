# Admin/Frontend Session Isolation (Prod Deployment TODO)

## The problem

Django admin (`/admin/login/`) and the API's `SessionAuthentication` both
authenticate off the same `sessionid` cookie — same domain, same session
store. Logging into Django admin logs you into the frontend app too, and
vice versa. There's no way to be logged in as two different accounts
(one in admin, one in the app) in the same browser.

This is expected Django behavior, not a bug — Django doesn't treat
"admin" and "your app" as separate identities by default.

## Dev workaround (no config needed)

Use separate browser contexts:
- Normal window → frontend app
- Incognito/private window → `/admin/`

## Permanent fix (do this during prod deployment config)

Run Django admin on its **own subdomain**, separate from the API:

- Frontend: `campusandclubs.com`
- API: `api.campusandclubs.com`
- Admin: `admin.campusandclubs.com` ← new

### Important: `SESSION_COOKIE_DOMAIN` is one global setting per process

You can't set it to two different values in the same running Django app —
it's a single settings value, not something you can vary per-request or
per-subdomain within one process. So isolating admin's cookie actually
requires running admin as a **separate Django process** with its own
settings module, not just a URL prefix inside the same app.

### Steps

1. **Split the URLconf.** Create an admin-only URLs file that includes
   *just* the admin site, nothing else:

   ```python
   # core/urls_admin.py
   from django.contrib import admin
   from django.urls import path

   urlpatterns = [
       path("admin/", admin.site.urls),
   ]
   ```

2. **Create a dedicated settings module** for the admin process, extending
   your existing `prod.py` but overriding the two things that matter:

   ```python
   # core/settings/admin.py
   from .prod import *  # noqa

   ROOT_URLCONF = "core.urls_admin"

   # No leading dot -> cookie is scoped ONLY to this exact host,
   # never sent to api.campusandclubs.com or campusandclubs.com.
   SESSION_COOKIE_DOMAIN = None
   CSRF_COOKIE_DOMAIN = None
   ```

   Meanwhile your existing `prod.py` (used by the api/frontend process)
   keeps the shared setting as planned:

   ```python
   SESSION_COOKIE_DOMAIN = ".campusandclubs.com"
   CSRF_COOKIE_DOMAIN = ".campusandclubs.com"
   ```

3. **Run two separate processes** from the same codebase, differing only
   in `DJANGO_SETTINGS_MODULE`:

   ```bash
   # api/frontend process
   DJANGO_SETTINGS_MODULE=core.settings.prod gunicorn core.wsgi:application

   # admin process (separate port, separate process)
   DJANGO_SETTINGS_MODULE=core.settings.admin gunicorn core.wsgi:application --bind 127.0.0.1:8001
   ```

4. **Route by subdomain at the reverse proxy** (Nginx example):

   ```nginx
   server {
       server_name admin.campusandclubs.com;
       location / {
           proxy_pass http://127.0.0.1:8001;
       }
   }

   server {
       server_name api.campusandclubs.com;
       location / {
           proxy_pass http://127.0.0.1:8000;
       }
   }
   ```

Since cookies are domain-scoped, an admin session cookie scoped only to
`admin.campusandclubs.com` (no leading dot, no explicit domain) will
never be sent to or readable from `api.campusandclubs.com`, so the two
logins stay fully independent — while the frontend/API pair still shares
its cookie across the `.campusandclubs.com` domain as intended.

## Why this is worth doing anyway

Putting admin on its own subdomain is a common security practice
independent of this bug:
- Smaller attack surface (admin not reachable from the main app's domain)
- Can apply separate rate limiting / IP allowlisting to `admin.*` easily
- Keeps admin sessions from ever mixing with user-facing auth flows

## Status

Not urgent — dev workaround (incognito) is sufficient until production
deployment configuration (`CSRF_COOKIE_DOMAIN`, `SESSION_COOKIE_DOMAIN`,
HTTPS hardening, `CORS_ALLOWED_ORIGINS`) is being finalized. Revisit then.