#Functions and routes related to Project handling

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional
from ..database import get_db
from .auth import get_current_user, get_current_admin_user
from ..audit_log import log_audit


router = APIRouter()

@router.post("/projects/", response_model=schemas.TestProjectResponse)
def create_project(project_data: schemas.TestProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Create a new project (Admin only)"""
    new_project = models.TestProject(
        project_name=project_data.project_name
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    log_audit(
        db,
        current_user.id,
        action="Create Project",
        resource_type="Project",
        resource_id=new_project.id,
        details={"Project Name": new_project.project_name}
    )

    return new_project

@router.get("/projects/", response_model=List[schemas.TestProjectResponse])
def get_test_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Retrieve a list of all test projects (Admin only)"""
    projects = db.query(models.TestProject).all()
    return projects

@router.post("/projects/{project_id}/assign-user/")
def assign_user_to_project(
    project_id: int, user_id: int = Query(None, description="ID of the user to assign"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Assign a user to a project (Admin only)"""
    project = db.query(models.TestProject).filter(models.TestProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if project not in user.projects:
        user.projects.append(project)
        db.commit()

        log_audit(
            db,
            current_user.id,
            action="Assign user to project",
            resource_type="Project",
            resource_id=project_id,
            details={"Assigned User ID": user_id, "Username": user.username}
        )

    return {"message": f"User {user.username} assigned to project {project.project_name}"}

@router.get("/projects/my", response_model=List[schemas.TestProjectResponse])
def get_my_test_projects(
    project_name: Optional[str] = Query(None, description="Search by project name"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve a list of projects assigned to the currently logged in user"""
    if current_user.role.lower() == "admin":
        # Admin users can see all projects, so start with a query for all projects
        query = db.query(models.TestProject)
    else:
        # For standard users, only the projects they are assigned to
        if not current_user.projects:
            raise HTTPException(status_code=404, detail="No projects found for the current user")
        project_ids = [p.id for p in current_user.projects]
        query = db.query(models.TestProject).filter(models.TestProject.id.in_(project_ids))

    if project_name:
        query = query.filter(models.TestProject.project_name.ilike(f"%{project_name}%"))

    return query.all()

@router.delete("/projects/{project_id}", response_model=dict)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Delete the project by ID (Admin only)"""
    project = db.query(models.TestProject).filter(models.TestProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()

    log_audit(
        db,
        current_user.id,
        action="Delete Project",
        resource_type="Project",
        resource_id=project_id,
        details={"project_name": project.project_name}
    )

    return {"message": "Project deleted"}

@router.post("/favourite-projects/", response_model=schemas.FavoriteProjectResponse)
def add_favourite_project(
    favourite: schemas.FavoriteProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add a project to user's favourites"""

    project_id = favourite.project_id

    project = db.query(models.TestProject).filter(models.TestProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = db.query(models.FavoriteProject).filter(
        models.FavoriteProject.user_id == current_user.id,
        models.FavoriteProject.project_id == project_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project already favourited")

    fav = models.FavoriteProject(user_id=current_user.id, project_id=project_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

@router.delete("/favourite-projects/{project_id}", response_model=dict)
def remove_favourite_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Remove a project from user's favourites"""
    fav = db.query(models.FavoriteProject).filter(
        models.FavoriteProject.user_id == current_user.id,
        models.FavoriteProject.project_id == project_id
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite project not found")
    db.delete(fav)
    db.commit()
    return {"message": "Project removed from favourites"}

@router.get("/favourite-projects/", response_model=List[schemas.TestProjectResponse])
def get_favourite_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve user's favourite projects"""
    favs = db.query(models.FavoriteProject).filter(models.FavoriteProject.user_id == current_user.id).all()
    project_ids = [fav.project_id for fav in favs]
    projects = db.query(models.TestProject).filter(models.TestProject.id.in_(project_ids)).all()
    return projects
