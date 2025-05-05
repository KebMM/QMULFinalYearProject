#Routes for metrics

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ..database import get_db
from typing import List, Optional
from .. import models, schemas

router = APIRouter()

@router.get("/aggregated-reports/")
def get_aggregated_reports(
    suite_id: int = Query(None, description="Filter by test suite ID"),
    project_id: int = Query(None, description="Filter by test project ID"),
    db: Session = Depends(get_db)
):
    """Retreives aggregated reports"""
    query = db.query(
        func.count(models.TestReport.id).label("total_tests"),
        func.sum(case((models.TestReport.status == "PASS", 1), else_=0)).label("passed_tests"),
        func.sum(case((models.TestReport.status == "FAIL", 1), else_=0)).label("failed_tests"),
        func.avg(models.TestReport.execution_time).label("avg_execution_time")
    )

    if project_id:
        query = query.filter(models.TestReport.test_project_id == project_id)
    if suite_id:
        query = query.filter(models.TestReport.test_suite_id == suite_id)

    result = query.one()
    aggregated_report = {
        "total_tests": result.total_tests,
        "passed_tests": result.passed_tests,
        "failed_tests": result.failed_tests,
        "pass_rate": (result.passed_tests / result.total_tests * 100) if result.total_tests else 0,
        "avg_execution_time": float(result.avg_execution_time) if result.avg_execution_time else 0
    }
    return aggregated_report

@router.get("/aggregated-by-suite/", response_model=List[schemas.TestSuiteAggregationResponse])
def get_aggregated_by_suite(
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db)
):
    """Aggregates test report data by test suite"""
    query = db.query(
        models.TestSuite.suite_name,
        func.count(models.TestReport.id).label("total_tests"),
        func.sum(case((models.TestReport.status == "PASS", 1), else_=0)).label("passed_tests"),
        func.sum(case((models.TestReport.status == "FAIL", 1), else_=0)).label("failed_tests"),
        func.avg(models.TestReport.execution_time).label("avg_execution_time")
    ).join(models.TestReport, models.TestSuite.id == models.TestReport.test_suite_id)

    if project_id:
        query = query.filter(models.TestSuite.project_id == project_id)

    query = query.group_by(models.TestSuite.id)
    results = query.all()

    aggregated = []
    for result in results:
        pass_rate = (result.passed_tests / result.total_tests * 100) if result.total_tests else 0
        aggregated.append({
            "suite_name": result.suite_name,
            "total_tests": result.total_tests,
            "passed_tests": result.passed_tests,
            "failed_tests": result.failed_tests,
            "pass_rate": pass_rate,
            "avg_execution_time": float(result.avg_execution_time) if result.avg_execution_time is not None else 0,
        })

    return aggregated

@router.get("/tests-per-day/")
def tests_per_day(
    project_id: int = Query(None, description="Filter by test project ID"),
    suite_id: int = Query(None, description="Filter by test suite ID"),
    db: Session = Depends(get_db)
):
    """Returns the number of tests executed per day"""
    query = db.query(
        func.date(models.TestReport.timestamp).label("date"),
        func.count(models.TestReport.id).label("count")
    )
    if project_id:
        query = query.filter(models.TestReport.test_project_id == project_id)
    query = query.group_by(func.date(models.TestReport.timestamp)).order_by(func.date(models.TestReport.timestamp))
    if suite_id:
        query = query.filter(models.TestReport.test_suite_id == suite_id)
    query = query.group_by(func.date(models.TestReport.timestamp)).order_by(func.date(models.TestReport.timestamp))
    results = query.all()
    return [{"date": r.date.isoformat(), "count": r.count} for r in results]

@router.get("/tests-per-week/")
def tests_per_week(
    project_id: int = Query(None, description="Filter by test project ID"),
    suite_id: int = Query(None, description="Filter by test suite ID"),
    db: Session = Depends(get_db)
):
    """Returns the number of tests executed per week"""
    query = db.query(
        func.date_trunc('week', models.TestReport.timestamp).label("week"),
        func.count(models.TestReport.id).label("count")
    )
    if project_id:
        query = query.filter(models.TestReport.test_project_id == project_id)
    query = query.group_by(func.date_trunc('week', models.TestReport.timestamp)).order_by(func.date_trunc('week', models.TestReport.timestamp))
    if suite_id:
        query = query.filter(models.TestReport.test_suite_id == suite_id)
    query = query.group_by(func.date(models.TestReport.timestamp)).order_by(func.date(models.TestReport.timestamp))
    results = query.all()
    # Format the week as ISO date (e.g. "2025-03-03T00:00:00")
    return [{"week": r.week.isoformat(), "count": r.count} for r in results]

@router.get("/error-types-metrics/", response_model=schemas.ErrorMetricsResponse)
def get_error_types_metrics(
    project_id: int = Query(..., description="Project ID"),
    suite_id: int = Query(None, description="Filter by test suite ID"),
    db: Session = Depends(get_db)
):
    """
    Returns a count of different error types from failed test steps
    """
    query = db.query(
        models.TestStep.error_message,
        func.count(models.TestStep.id).label("count")
    ).join(
        models.TestReport, models.TestReport.id == models.TestStep.test_report_id
    ).filter(
        models.TestStep.step_status.in_(["FAIL", "ERROR"])
    ).filter(
        models.TestReport.test_project_id == project_id
    )

    if suite_id:
        query = query.filter(models.TestReport.test_suite_id == suite_id)

    query = query.group_by(models.TestStep.error_message)
    results = query.all()

    aggregated_errors = {}

    def unify_error_message(msg: str) -> str:
        """
        Make sure errors that are the same (but may have different metadata in the full error message)
        are counted as the same error
        """
        if not msg:
            return "Unknown Error"

        if "Components used:" in msg:
            return ""

        if msg.lower().startswith("message:"):
            msg = msg[8:].strip()

        # Unify common error patterns
        if "element click intercepted" in msg.lower():
            return "element click intercepted"

        # Keep only the first 3 words to reduce duplicates.
        words = msg.split()
        short_msg = " ".join(words[:3])
        return short_msg.strip()

    for row in results:
        original_msg = row.error_message or ""
        short_key = unify_error_message(original_msg)
        if not short_key:
            continue

        if short_key not in aggregated_errors:
            aggregated_errors[short_key] = 0
        aggregated_errors[short_key] += row.count

    labels = list(aggregated_errors.keys())
    counts = [aggregated_errors[k] for k in labels]

    return {"labels": labels, "values": counts}
