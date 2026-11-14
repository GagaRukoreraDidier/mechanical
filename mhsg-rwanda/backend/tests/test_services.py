import pytest
from django.contrib.auth import get_user_model
from apps.catalog.models import ServiceCategory
from apps.requests.models import ServiceRequest
from apps.requests.services import RequestService
from apps.billing.models import Payment, FeeConfiguration
from apps.billing.services import PaymentService
from apps.providers.models import ProviderProfile
from apps.connections.models import Connection
from apps.connections.services import ConnectionService

User = get_user_model()

@pytest.mark.django_db
def test_request_lifecycle_and_privacy_unlock():
    # 1. Create customer & provider
    customer = User.objects.create_user(
        email="customer@example.com",
        password="Password123!",
        role=User.Role.CUSTOMER,
        phone="+250788123456",
        phone_consent=True,
    )
    prov_user = User.objects.create_user(
        email="garage@example.com",
        password="Password123!",
        role=User.Role.GARAGE,
    )
    provider = ProviderProfile.objects.create(
        user=prov_user,
        display_name="Kigali Auto Master",
        provider_types=["GARAGE"],
        verification_status=ProviderProfile.VerificationStatus.BUSINESS_CHECKED,
    )
    admin = User.objects.create_user(
        email="admin@example.com",
        password="Password123!",
        role=User.Role.ADMIN,
        is_staff=True,
    )

    cat = ServiceCategory.objects.create(
        name="Brakes & Suspension",
        category_type=ServiceCategory.CategoryType.AUTOMOTIVE_SERVICE,
        slug="brakes",
    )

    # 2. Customer creates draft
    req = ServiceRequest.objects.create(
        customer=customer,
        category=cat,
        description="Squeaking noise when braking from front left wheel",
        urgency=ServiceRequest.Urgency.STANDARD,
        approximate_location="Kicukiro, Kigali",
        province="Kigali City",
        district="Kicukiro",
        vehicle_make="Toyota",
        vehicle_model="RAV4",
    )
    assert req.status == ServiceRequest.Status.DRAFT

    # 3. Customer submits request -> awaits activation fee
    req = RequestService.submit_request(req, actor=customer)
    assert req.status == ServiceRequest.Status.AWAITING_REQUEST_PAYMENT

    # 4. Activation fee payment simulated
    payment = PaymentService.create_payment_intent(
        payer=customer,
        purpose=Payment.Purpose.REQUEST_FEE,
        related_obj=req,
        amount_rwf=1000,
    )
    PaymentService.handle_payment_success(payment, external_ref="TX-REQ-001", actor=customer)

    req.refresh_from_db()
    assert req.status == ServiceRequest.Status.SUBMITTED
    assert req.fee_status == ServiceRequest.FeeStatus.SUCCEEDED

    # 5. Admin starts review and publishes
    RequestService.admin_review_decision(req, "start_review", admin_user=admin)
    req.refresh_from_db()
    assert req.status == ServiceRequest.Status.UNDER_REVIEW

    RequestService.publish_request(req, admin_user=admin, target_provider_ids=[provider.id])
    req.refresh_from_db()
    assert req.status == ServiceRequest.Status.PUBLISHED

    # 6. Customer approves connection
    conn = ConnectionService.create_connection_for_request(req, provider)
    RequestService.customer_approval(req, customer_user=customer, approved=True)
    req.refresh_from_db()
    assert req.status == ServiceRequest.Status.AWAITING_CONNECTION_PAYMENT

    # 7. Privacy check: before payment, connection is PENDING and contact details are NOT unlocked
    assert conn.connection_status == Connection.Status.PENDING_PAYMENT
    assert "phone" not in conn.unlocked_fields

    # 8. Provider pays connection fee -> system unlocks authorized phone
    conn_payment = PaymentService.create_payment_intent(
        payer=prov_user,
        purpose=Payment.Purpose.CONNECTION_FEE,
        related_obj=conn,
        amount_rwf=2500,
    )
    PaymentService.handle_payment_success(conn_payment, external_ref="TX-CONN-001", actor=prov_user)

    conn.refresh_from_db()
    req.refresh_from_db()
    assert conn.connection_status == Connection.Status.ACTIVE
    assert "phone" in conn.unlocked_fields
    assert req.status == ServiceRequest.Status.CONNECTED
