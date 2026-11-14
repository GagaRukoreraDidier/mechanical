from .models import AuditEvent

class AuditService:
    @staticmethod
    def log_event(
        action: str,
        object_type: str,
        object_id: str,
        actor=None,
        before_data=None,
        after_data=None,
        ip_address=None,
        user_agent="",
    ):
        """Append-only audit event logging."""
        try:
            return AuditEvent.objects.create(
                actor=actor,
                action=action,
                object_type=object_type,
                object_id=str(object_id),
                before_data=before_data,
                after_data=after_data,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        except Exception:
            # Audit logging failure should not crash core user workflows, but print/log
            pass
