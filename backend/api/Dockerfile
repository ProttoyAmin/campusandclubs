# =============================================================================
# Dockerfile — Campus & Clubs Django API (OPTIONAL / Educational)
# =============================================================================
#
# WHAT IS A DOCKERFILE?
#   A Dockerfile is a recipe (a set of instructions) that tells Docker how to
#   build a custom "image". An image is like a snapshot of a computer that has
#   your app and all its dependencies pre-installed. You can then run that
#   image as a "container" (a lightweight, isolated process).
#
# DO YOU NEED THIS RIGHT NOW?
#   NO — for your current setup, you only need the docker-compose.yml which
#   runs Redis from a pre-built image. Your Django app runs directly on your
#   machine (outside Docker).
#
#   This Dockerfile is here so you can LEARN how containerizing Django works.
#   When you're ready to deploy to production, you'd use a Dockerfile like
#   this to package your entire Django app into an image.
#
# HOW TO BUILD & RUN (when you're ready to try it):
#   docker build -t campusandclubs-api .
#   docker run -p 8000:8000 campusandclubs-api
#
# =============================================================================
#
# SLIM vs ALPINE — Why We Use slim Here
# --------------------------------------
# You'll see a lot of tutorials use "alpine" (e.g. python:3.13-alpine).
# Alpine is TINY (~5MB base) which sounds great, but there's a catch:
#
#   Alpine uses "musl libc" instead of "glibc" (which every other Linux uses).
#
# Why that matters for Python:
#   - Most Python packages on PyPI ship pre-built wheels compiled against glibc.
#   - On Alpine (musl), those wheels DON'T WORK. pip/uv must compile them
#     from source, which means:
#       1. You need to install build tools (gcc, musl-dev, libffi-dev, etc.)
#       2. Builds are MUCH slower (minutes vs seconds)
#       3. Some packages may fail to compile entirely
#
#   Your project uses packages with C extensions:
#     - psycopg (PostgreSQL driver)  — needs libpq-dev
#     - Pillow (image processing)    — needs zlib, libjpeg, etc.
#     - channels-redis               — needs hiredis C bindings
#
#   On slim (glibc/Debian), these install instantly from pre-built wheels.
#   On Alpine, you'd need to add ~200MB of build tools and wait minutes.
#
# SIZE COMPARISON (approximate):
#   python:3.13-alpine  + build deps + compiled packages ≈ 250-350MB
#   python:3.13-slim    + pre-built wheels               ≈ 200-250MB
#
# TL;DR: Alpine is great for simple apps (Go, Rust, static binaries).
#        For Python, slim is almost always the better choice.
#        That's why Docker's official Python docs recommend slim too.
#
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: "builder" — Install all Python dependencies with uv
# ---------------------------------------------------------------------------
#
# WHAT ARE MULTI-STAGE BUILDS?
#   Docker images can get large if you install build tools (compilers, etc.)
#   just to install Python packages. Multi-stage builds let you:
#     1. Install everything in a "builder" stage (with all the build tools)
#     2. Copy only the final installed packages to a clean, small final image
#   Result: your final image is much smaller.

# "FROM" picks the base image. python:3.13-slim is:
#   - Official Python 3.13 image
#   - "slim" variant = minimal Debian, ~150MB (vs ~900MB full, ~50MB alpine)
#   - "AS builder" names this stage so we can reference it later
FROM python:3.13-slim AS builder

# "WORKDIR" sets the working directory inside the container.
# All subsequent commands (COPY, RUN, etc.) run relative to this path.
# Think of it like `cd /app` — if /app doesn't exist, Docker creates it.
WORKDIR /app

# "ENV" sets environment variables inside the container.
#
# PYTHONDONTWRITEBYTECODE=1
#   Prevents Python from creating .pyc files (compiled bytecode cache).
#   Inside a container the filesystem is temporary anyway, so .pyc files
#   just waste space.
#
# PYTHONUNBUFFERED=1
#   Forces Python's stdout/stderr to be unbuffered. Without this, print()
#   and log output might be delayed or lost when viewing container logs.
#   Always set this in Docker.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# ---------------------------------------------------------------------------
# Install uv — the fast Python package manager you're already using
# ---------------------------------------------------------------------------
#
# WHAT IS uv?
#   uv is an extremely fast Python package manager written in Rust.
#   It replaces pip, pip-tools, and virtualenv. It reads pyproject.toml
#   and uv.lock (like npm's package.json and package-lock.json).
#
# We install uv using its official standalone installer script.
# The `--frozen` flag we'll use later means "install exactly what's
# in uv.lock, don't try to resolve or update anything."
#
# COPY --from=ghcr.io/astral-sh/uv:latest copies the uv binary directly
# from Astral's official uv Docker image — no need to curl/install anything.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy ONLY the dependency files first (not the whole project).
#
# WHY? Docker caches each layer (instruction). If pyproject.toml and uv.lock
# haven't changed, Docker reuses the cached layer and SKIPS `uv sync`
# entirely. This makes rebuilds much faster when you only change code
# (not dependencies). This is called "layer caching" and it's one of the
# most important Docker optimization techniques.
COPY pyproject.toml uv.lock ./

# "RUN" executes a command inside the container during the build.
#
# uv sync --frozen --no-dev --no-install-project
#   --frozen       → Use exactly what's in uv.lock (no resolution/updates)
#   --no-dev       → Skip dev dependencies (ruff, django-stubs, etc.)
#   --no-install-project → Don't install the project itself, just dependencies
#
# This creates a .venv/ directory inside /app with all your packages.
RUN uv sync --frozen --no-dev --no-install-project

# Now copy the rest of your project code.
# This is AFTER `uv sync` so changing code doesn't invalidate the
# dependency cache layer.
COPY . .

# Install the project itself (now that the code is available).
# This is a separate step so the dependency layer stays cached.
RUN uv sync --frozen --no-dev

# ---------------------------------------------------------------------------
# Stage 2: "runtime" — The actual image that runs your app
# ---------------------------------------------------------------------------

FROM python:3.13-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy the entire /app directory from the builder (includes .venv/ and code).
COPY --from=builder /app /app

# Add the virtual environment's bin directory to PATH so we can run
# daphne, django-admin, etc. without specifying the full path.
#
# This is what `source .venv/bin/activate` does on your machine —
# but in Docker we set PATH directly instead.
ENV PATH="/app/.venv/bin:$PATH"

# "EXPOSE" documents which port your app listens on.
# It does NOT actually publish the port — that's done with `docker run -p`
# or the `ports:` key in docker-compose.yml. EXPOSE is just metadata/docs.
EXPOSE 8000

# "CMD" is the default command that runs when the container starts.
#
# "daphne" is the ASGI server your project uses (it's in INSTALLED_APPS).
# It serves both HTTP and WebSocket connections.
#
#   -b 0.0.0.0  → Listen on all network interfaces (required in Docker,
#                  otherwise the container only listens on 127.0.0.1 which
#                  is not reachable from outside the container)
#   -p 8000     → Listen on port 8000
#   core.asgi:application → The ASGI app entry point (from your asgi.py)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]
