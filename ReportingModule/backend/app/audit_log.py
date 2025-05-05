#For logging key changes made

from sqlalchemy.orm import Session
from . import models

def log_audit(
    db: Session,
    user_id: int,
    action: str,
    resource_type: str,
    resource_id: int = None,
    details: dict = None
):
    """
    Records an audit log entry
    Function is called in relevant route functions
    to keep track of certain actions
    """
    audit_entry = models.AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details
    )
    db.add(audit_entry)
    db.commit()
