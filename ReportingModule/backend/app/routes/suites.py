#For Suite routes

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..database import get_db
from .auth import get_current_user, get_current_admin_user
from fastapi import Depends, Query, HTTPException
from typing import List
from ..audit_log import log_audit

router = APIRouter()

@router.post("/create-test-suite/", response_model=schemas.TestSuiteResponse)
def create_test_suite(suite_data: schemas.TestSuiteCreate, db: Session = Depends(get_db)):
    """
    Create a new test suit
    """
    new_suite = models.TestSuite(suite_name=suite_data.suite_name,
                                 project_id=suite_data.project_id)
    db.add(new_suite)
    db.commit()
    db.refresh(new_suite)
    return new_suite

@router.get("/test-suites/", response_model=List[schemas.TestSuiteResponse])
def get_test_suites(project_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns all test suites. If a project_id is provided,
    returns only suites related to that project
    """
    query = db.query(models.TestSuite)

    if project_id:
        query = query.filter(models.TestSuite.project_id == project_id)

    return query.all()

@router.delete("/test-suites/{suite_id}")
def delete_test_suite(suite_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin_user)):
    """
    Delete the suite specified by the suite ID
    """
    suite = db.query(models.TestSuite).filter(models.TestSuite.id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail="Test suite not found")
    db.delete(suite)
    db.commit()

    log_audit(
        db,
        current_user.id,
        action="Delete Test Suite",
        resource_type="Test Suite",
        resource_id=suite_id,
        details={"Suite Name": suite.suite_name}
    )

    return {"message": "Test suite deleted"}

@router.patch("/test-suites/{suite_id}", response_model=schemas.TestSuiteResponse)
def update_test_suite(
    suite_id: int,
    suite_data: schemas.TestSuiteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update an existing test suite (Admin only)
    Updates the suite name and associated project
    """
    suite = db.query(models.TestSuite).filter(models.TestSuite.id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail="Test suite not found")

    suite.suite_name = suite_data.suite_name
    suite.project_id = suite_data.project_id
    db.commit()
    db.refresh(suite)

    log_audit(
        db,
        current_user.id,
        action="Update Test Suite",
        resource_type="Test Suite",
        resource_id=suite_id,
        details={"New Suite Name": suite_data.suite_name, "New Project ID": suite_data.project_id}
    )

    return suite
