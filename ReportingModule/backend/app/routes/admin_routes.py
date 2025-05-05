#Admin only routes

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from .. import models, schemas
from .auth import get_current_admin_user
from ..audit_log import log_audit

router = APIRouter()

@router.get("/users/", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Retrieves a list of all users and their assigned projects
    """
    users = db.query(models.User).options(joinedload(models.User.projects)).all()
    return users

@router.patch("/users/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: int,
    role_data: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Update the role of the specified user and logs change for audit history
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    old_role = user.role
    user.role = role_data.role.lower()
    db.commit()
    db.refresh(user)

    log_audit(
        db,
        current_user.id,
        action="Update User Role",
        resource_type="User",
        resource_id=user_id,
        details={"Old Role": old_role, "New Role": user.role}
    )

    return user

@router.delete("/users/{user_id}", response_model=schemas.UserResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Deletes a user by ID and logs changes
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()

    log_audit(
        db,
        current_user.id,
        action="Delete User",
        resource_type="User",
        resource_id=user_id,
        details={"Username": user.username}
    )

    return user

@router.delete("/users/{user_id}/projects", response_model=dict)
def unassign_user_from_project(
    user_id: int,
    project_id: int = Query(..., description="ID of the project to unassign"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Unassign the specified user from the given project.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    project = db.query(models.TestProject).filter(models.TestProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project not in user.projects:
        raise HTTPException(status_code=400, detail="User is not assigned to this project")

    user.projects.remove(project)
    db.commit()
    return {"message": f"User {user.username} unassigned from project {project.project_name}"}

@router.get("/audit-logs/", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Retrieves all audit logs
    """
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()
    return logs
