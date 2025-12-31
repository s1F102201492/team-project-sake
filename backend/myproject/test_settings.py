from .settings import *

# Override Database to use SQLite
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test_db.sqlite3",
    }
}

# Remove apps that rely on Postgres-specific features (like VectorField)
POSTGRES_APPS = ["api", "ai_recommend", "event", "stamprally"]
INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in POSTGRES_APPS]

if "chat" not in INSTALLED_APPS:
    INSTALLED_APPS.append("chat")

# Use minimal URL conf
ROOT_URLCONF = 'myproject.test_urls'
