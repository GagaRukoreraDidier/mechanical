import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.SUPER_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", _("Customer / Requester")
        SELLER = "SELLER", _("Spare Parts Seller")
        GARAGE = "GARAGE", _("Garage / Workshop")
        MECHANIC = "MECHANIC", _("Independent Mechanic")
        HOME_TECH = "HOME_TECH", _("Home Service Technician")
        ADMIN = "ADMIN", _("Administrator")
        SUPER_ADMIN = "SUPER_ADMIN", _("Super Administrator")
        SUPPORT = "SUPPORT", _("Support / Moderator")

    class Language(models.TextChoices):
        ENGLISH = "en", _("English")
        KINYARWANDA = "rw", _("Kinyarwanda")
        FRENCH = "fr", _("French")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    full_name = models.CharField(_("full name"), max_length=255, blank=True)
    phone = PhoneNumberField(_("phone number"), blank=True, null=True)
    role = models.CharField(
        _("role"),
        max_length=30,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    preferred_language = models.CharField(
        _("preferred language"),
        max_length=5,
        choices=Language.choices,
        default=Language.ENGLISH,
    )
    
    # Customer privacy and disclosure consent
    phone_consent = models.BooleanField(
        _("phone sharing consent"),
        default=False,
        help_text=_("Allow sharing phone number with approved provider upon unlock.")
    )
    address_consent = models.BooleanField(
        _("address sharing consent"),
        default=False,
        help_text=_("Allow sharing exact address with approved provider upon unlock.")
    )

    is_staff = models.BooleanField(_("staff status"), default=False)
    is_active = models.BooleanField(_("active"), default=True)
    date_joined = models.DateTimeField(_("date joined"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER

    @property
    def is_provider(self):
        return self.role in [
            self.Role.SELLER,
            self.Role.GARAGE,
            self.Role.MECHANIC,
            self.Role.HOME_TECH,
        ]

    @property
    def is_admin_user(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPER_ADMIN]
