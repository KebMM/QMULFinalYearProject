#Unit tests for report endpoints

from fastapi.testclient import TestClient
from backend.app.main import app
from datetime import datetime, timedelta, timezone
import time

client = TestClient(app)

def get_auth_headers():
    login_data = {"username": "TestAdmin", "password": "password123"}
    response = client.post("/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_report(payload, headers):
    response = client.post("/submit-test-result/", json=payload, headers=headers)
    assert response.status_code == 200, f"Submit test report status: {response.status_code}"
    return response.json()["test_id"]

def delete_test_report(test_id, headers):
    response = client.delete(f"/test-results/{test_id}", headers=headers)
    assert response.status_code == 200, f"Delete test report status: {response.status_code}"

def add_comment(test_id: int, text: str, headers: dict) -> int:
    resp = client.post(
        f"/test-results/{test_id}/comments",
        json={"comment_text": text},
        headers=headers,
    )
    assert resp.status_code == 200, resp.json()
    return resp.json()["id"]


def test_submit_test_result():
    payload = {
        "test_name": "unit_submit",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": "2025-02-22T12:00:00",
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "UnitTest",
        "test_project_id": 3
    }
    headers = get_auth_headers()
    submit_response = client.post("/submit-test-result/", json=payload, headers=headers)
    test_id = submit_response.json()["test_id"]
    assert submit_response.status_code == 200
    data = submit_response.json()
    assert "test_id" in data

    delete_test_report(test_id, headers)

def test_get_all_test_results():
    headers = get_auth_headers()
    response = client.get("/test-results/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_test_report_by_id():
    payload = {
        "test_name": "unit_get_testId",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": "2025-02-22T12:00:00",
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "UnitTest",
        "test_project_id": 3
    }
    headers = get_auth_headers()
    submit_response = client.post("/submit-test-result/", json=payload, headers=headers)
    test_id = submit_response.json()["test_id"]

    report_response = client.get(f"/test-results/{test_id}", headers=headers)
    assert report_response.status_code == 200
    report_data = report_response.json()
    assert report_data["id"] == test_id

    delete_test_report(test_id, headers)

def test_filter_by_test_name():
    headers = get_auth_headers()
    payload = {
        "test_name": "UniqueTestName123",
        "status": "PASS",
        "execution_time": 2,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "FilterTestSuite",
        "test_project_id": 1
    }
    test_id = create_test_report(payload, headers)

    # Filter by test name
    response = client.get("/test-results/", params={"test_name": "UniqueTestName123"}, headers=headers)
    assert response.status_code == 200
    reports = response.json()
    assert any(report["test_name"] == "UniqueTestName123" for report in reports)

    delete_test_report(test_id, headers)

def test_filter_by_status():
    headers = get_auth_headers()
    # Create a test report with status FAIL.
    payload = {
        "test_name": "StatusFilterTest",
        "status": "FAIL",
        "execution_time": 3,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "StatusSuite",
        "test_project_id": 1
    }
    test_id = create_test_report(payload, headers)

    # Filter by status
    response = client.get("/test-results/", params={"status": "FAIL"}, headers=headers)
    assert response.status_code == 200
    reports = response.json()
    assert any(report["status"] == "FAIL" for report in reports)

    delete_test_report(test_id, headers)

def test_filter_by_date_range():
    headers = get_auth_headers()
    now = datetime.now(timezone.utc)
    # Create two test reports with timestamps two days apart
    payload1 = {
        "test_name": "DateFilterTest1",
        "status": "PASS",
        "execution_time": 2,
        "timestamp": (now - timedelta(days=2)).isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "DateSuite",
        "test_project_id": 1
    }
    payload2 = {
        "test_name": "DateFilterTest2",
        "status": "PASS",
        "execution_time": 2,
        "timestamp": now.isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "DateSuite",
        "test_project_id": 1
    }
    test_id1 = create_test_report(payload1, headers)
    test_id2 = create_test_report(payload2, headers)

    # Define a date range which includes only the first report
    start_date = (now - timedelta(days=3)).strftime("%Y-%m-%d")
    end_date = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    response = client.get("/test-results/", params={"start_date": start_date, "end_date": end_date, "project_id": 1}, headers=headers)
    assert response.status_code == 200
    reports = response.json()
    names = [report["test_name"] for report in reports]
    assert "DateFilterTest1" in names
    assert "DateFilterTest2" not in names

    # Cleanup
    delete_test_report(test_id1, headers)
    delete_test_report(test_id2, headers)

def test_sort_by_most_recent():
    headers = get_auth_headers()
    now = datetime.now(timezone.utc)
    # Create two test reports with different timestamps.
    payload1 = {
        "test_name": "SortTest1",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": (now - timedelta(minutes=10)).isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "SortSuite",
        "test_project_id": 1
    }
    payload2 = {
        "test_name": "SortTest2",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": now.isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "SortSuite",
        "test_project_id": 1
    }
    test_id1 = create_test_report(payload1, headers)
    test_id2 = create_test_report(payload2, headers)

    response = client.get("/test-results/", params={"project_id": 1, "sort_by": "most_recent"}, headers=headers)
    assert response.status_code == 200
    reports = response.json()

    # SortTest2 should be first in the list.
    assert reports[0]["test_name"] == "SortTest2"

    delete_test_report(test_id1, headers)
    delete_test_report(test_id2, headers)

def test_add_comment():
    headers = get_auth_headers()
    suffix  = int(time.time()*1000)

    payload = {
        "test_name": f"CommentTest_{suffix}",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "CommentSuite",
        "test_project_id": 1,
    }
    test_id = create_test_report(payload, headers)

    comment_text = "Automated unit-test comment"
    comment_id   = add_comment(test_id, comment_text, headers)

    resp = client.get(f"/test-results/{test_id}/comments", headers=headers)
    assert resp.status_code == 200
    comments = resp.json()
    assert any(c["id"] == comment_id and c["comment_text"] == comment_text for c in comments)

    delete_test_report(test_id, headers)
