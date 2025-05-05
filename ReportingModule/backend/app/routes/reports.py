#Routes for Test Reports handling

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user, get_current_admin_user
from fastapi import Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc
from typing import List, Optional
from datetime import datetime, timedelta
from ..audit_log import log_audit

router = APIRouter()

@router.post("/submit-test-result/")
def submit_test_result(test_data: schemas.TestResultCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Handles storing test results containg all test details.
    """
    if test_data.test_project_id:
        project = db.query(models.TestProject).filter(models.TestProject.id == test_data.test_project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Test project not found")

        if current_user.role.lower() != "admin":
            if project not in current_user.projects:
                raise HTTPException(status_code=403, detail="Not authorized to assign tests to this project")

    suite_id = test_data.test_suite_id
    if test_data.test_suite_name:
        suite = db.query(models.TestSuite).filter(models.TestSuite.suite_name == test_data.test_suite_name.lower()).first()
        if not suite:
            suite = models.TestSuite(suite_name=test_data.test_suite_name.lower(), project_id=test_data.test_project_id)
            db.add(suite)
            db.commit()
            db.refresh(suite)
        suite_id = suite.id

    new_report = models.TestReport(
        test_name=test_data.test_name,
        status=test_data.status,
        execution_time=test_data.execution_time,
        timestamp=test_data.timestamp,
        test_suite_id=suite_id,
        test_project_id=test_data.test_project_id
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    #Add each test step associated with this test report
    for step in test_data.steps:
        new_step = models.TestStep(
            test_report_id=new_report.id,
            step_number=step.step_number,
            step_description=step.step_description,
            step_status=step.step_status,
            error_message=step.error_message,
            timestamp=step.timestamp
        )
        db.add(new_step)

    db.commit()

    return {"message": "Test result saved successfully", "test_id": new_report.id}

@router.get("/test-results/", response_model=list[schemas.TestReportResponse])
def get_all_test_results(
    test_name: str = Query(None, description="Filter by test name"),
    status: str = Query(None, description="Filter by test status (PASS/FAIL)"),
    start_date: str = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    suite_id: int = Query(None, description="Filter by test suite ID"),
    project_id: int = Query(None, description="Filter by project ID"),
    min_execution_time: Optional[float] = Query(None, description="Filter by minimum execution time in seconds"),
    max_execution_time: Optional[float] = Query(None, description="Filter by maximum execution time in seconds"),
    sort_by: str = Query("id", description="Sort tests by field, e.g., id, test_name, execution_time, most_recent"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)):
    """
    Retrieves all test reports
    Allows for querying to filter the results by test suite etc
    """

    with db as session:
        query = session.query(models.TestReport).options(joinedload(models.TestReport.steps))

        if current_user.role.lower() != "admin":
            project_ids = [project.id for project in current_user.projects]
            query = query.filter(models.TestReport.test_project_id.in_(project_ids))

        if suite_id:
            query = query.filter(models.TestReport.test_suite_id == suite_id)
        if test_name:
            query = query.filter(models.TestReport.test_name.ilike(f"%{test_name}%"))
        if status:
            query = query.filter(models.TestReport.status == status.upper())
        if start_date and end_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(models.TestReport.timestamp.between(start_dt, end_dt))
        elif start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(models.TestReport.timestamp >= start_dt)
        elif end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(models.TestReport.timestamp < end_dt)
        if project_id:
            query = query.filter(models.TestReport.test_project_id == project_id)
        if min_execution_time is not None:
            query = query.filter(models.TestReport.execution_time >= min_execution_time)
        if max_execution_time is not None:
            query = query.filter(models.TestReport.execution_time <= max_execution_time)

        if sort_by == "most_recent":
            query = query.order_by(desc(models.TestReport.timestamp))
        elif sort_by == "test_name":
            query = query.order_by(asc(models.TestReport.test_name))
        elif sort_by == "execution_time":
            query = query.order_by(asc(models.TestReport.execution_time))
        else:
            query = query.order_by(asc(models.TestReport.id))

        return query.all()

@router.get("/test-results/{test_id}", response_model=schemas.TestReportResponse)
def get_test_report(test_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single test report and its steps based on test_id
    """

    test_report = db.query(models.TestReport).filter(models.TestReport.id == test_id).first()

    if not test_report:
        return {"error": "Test report not found"}

    return test_report

@router.delete("/test-results/{test_id}", response_model=dict)
def delete_test_report(test_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """
    Delete the test report specified by test_id
    """
    report = db.query(models.TestReport).filter(models.TestReport.id == test_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Test report not found")
    db.delete(report)
    db.commit()

    log_audit(
        db,
        current_user.id,
        action="Delete Test Report",
        resource_type="Test Report",
        resource_id=test_id,
        details={"Test Name": report.test_name}
    )

    return {"message": "Test report deleted"}

@router.post("/test-results/{test_id}/comments", response_model=schemas.CommentResponse)
def add_comment(
    test_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Add comments to specific test reports
    """
    test_report = db.query(models.TestReport).filter(models.TestReport.id == test_id).first()
    if not test_report:
        raise HTTPException(status_code=404, detail="Test report not found")

    new_comment = models.Comment(
        test_report_id=test_id,
        user_id=current_user.id,
        comment_text=comment.comment_text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    new_comment.username = current_user.username
    return new_comment

@router.get("/test-results/{test_id}/comments", response_model=List[schemas.CommentResponse])
def get_comments(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve Comments for a specific test report
    """
    test_report = db.query(models.TestReport).filter(models.TestReport.id == test_id).first()
    if not test_report:
        raise HTTPException(status_code=404, detail="Test report not found")

    comments = db.query(models.Comment).filter(models.Comment.test_report_id == test_id).order_by(models.Comment.created_at.desc()).all()
    for c in comments:
        c.username = c.user.username if c.user else "Unknown"
    return comments
