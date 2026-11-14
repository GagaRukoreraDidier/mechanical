"""
Pytest configuration for MHSG Rwanda backend tests.

Provides shared fixtures for integration and unit testing.
"""
import pytest
import django
from django.conf import settings


def pytest_configure(config):
    """Set up Django settings for pytest."""
    import os
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
    os.environ.setdefault("DATABASE_URL", "postgis://postgres:postgres@localhost:5432/mhsg_rwanda_test")
    os.environ.setdefault("SECRET_KEY", "pytest-insecure-key-change-in-production")
    os.environ.setdefault("DEBUG", "True")
    os.environ.setdefault("REDIS_URL", "redis://localhost:6379/1")
    os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "True")


@pytest.fixture(scope="session")
def django_db_setup():
    """Use a dedicated test database."""
    pass


@pytest.fixture
def api_client():
    """DRF APIClient for endpoint testing."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Create a superuser for admin-level tests."""
    from apps.accounts.models import User
    return User.objects.create_superuser(
        email="test_admin@mhsg.rw",
        password="TestAdmin@2026",
        first_name="Test",
        last_name="Admin",
        role="admin",
    )


@pytest.fixture
def customer_user(db):
    """Create a standard customer user."""
    from apps.accounts.models import User
    return User.objects.create_user(
        email="test_customer@mhsg.rw",
        password="TestCustomer@2026",
        first_name="Test",
        last_name="Customer",
        role="customer",
    )


@pytest.fixture
def provider_user(db):
    """Create a standard provider user."""
    from apps.accounts.models import User
    return User.objects.create_user(
        email="test_provider@mhsg.rw",
        password="TestProvider@2026",
        first_name="Test",
        last_name="Provider",
        role="garage_owner",
    )


@pytest.fixture
def auth_client(api_client, customer_user):
    """APIClient authenticated as the customer fixture user."""
    api_client.force_authenticate(user=customer_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """APIClient authenticated as the admin fixture user."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def provider_client(api_client, provider_user):
    """APIClient authenticated as the provider fixture user."""
    api_client.force_authenticate(user=provider_user)
    return api_client
