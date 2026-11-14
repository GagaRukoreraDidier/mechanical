"""Development settings."""
from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Console email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = []

# Django Debug Toolbar (optional — install separately if needed)
INTERNAL_IPS = ["127.0.0.1"]

# Less strict password validation in dev
AUTH_PASSWORD_VALIDATORS = []

# Fallback database when PostGIS/GDAL is not installed locally
if not globals().get("HAS_GDAL", False) or os.environ.get("USE_SQLITE", "true").lower() == "true":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Show full query errors
LOGGING["loggers"]["apps"]["level"] = "DEBUG"  # noqa: F405
