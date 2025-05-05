from datetime import datetime, timedelta, timezone
import time
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_admin_headers() -> dict:
    login_data = {"username": "TestAdmin", "password": "password123"}
    resp = client.post("/login", data=login_data)
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_test_report(payload: dict, headers: dict) -> int:
    """Submit a test-result and return the new test-id"""
    r = client.post("/submit-test-result/", json=payload, headers=headers)
    assert r.status_code == 200, r.json()
    return r.json()["test_id"]


def delete_test_report(test_id: int, headers: dict) -> None:
    r = client.delete(f"/test-results/{test_id}", headers=headers)
    assert r.status_code == 200, r.json()


def _make_step(status: str, msg: str = "", num: int = 1) -> dict:
    """Return a valid TestStepCreate body for the API."""
    return {
        "step_number": num,
        "step_description": "unit test",
        "step_status": status,
        "error_message": msg,
        "execution_time": 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "step_name": f"step_{int(time.time()*1000)}",
    }

def test_metrics_tests_per_day():
    """
    1.  create two test-reports on different days
    2.  call /tests-per-day?project_id=…
    3.  verify counts & cleanup
    """
    headers = get_admin_headers()
    now = datetime.now(timezone.utc)

    payload_yesterday = {
        "test_name": "MetricsDay_Y",
        "status": "PASS",
        "execution_time": 2,
        "timestamp": (now - timedelta(days=1)).isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "MetricsSuite",
        "test_project_id": 1,
    }
    payload_today = {
        "test_name": "MetricsDay_T",
        "status": "PASS",
        "execution_time": 2,
        "timestamp": now.isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "MetricsSuite",
        "test_project_id": 1,
    }

    id_y = create_test_report(payload_yesterday, headers)
    id_t = create_test_report(payload_today, headers)

    r = client.get("/tests-per-day/", params={"project_id": 1}, headers=headers)
    assert r.status_code == 200, r.json()
    data = r.json()
    per_day = {item["date"]: item["count"] for item in data}
    assert per_day[payload_yesterday["timestamp"][:10]] >= 1
    assert per_day[payload_today["timestamp"][:10]] >= 1

    # cleanup
    delete_test_report(id_y, headers)
    delete_test_report(id_t, headers)

def test_metrics_tests_per_week():
    """
    1. create two reports in different ISO weeks
    2. call /tests-per-week
    """
    headers = get_admin_headers()
    now = datetime.now(timezone.utc)
    last_week = now - timedelta(days=7)

    payload_last = {
        "test_name": "MetricsWeek_LW",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": last_week.isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "MetricsWeek",
        "test_project_id": 1,
    }
    payload_curr = {
        "test_name": "MetricsWeek_CW",
        "status": "PASS",
        "execution_time": 1,
        "timestamp": now.isoformat(),
        "steps": [],
        "test_suite_id": None,
        "test_suite_name": "MetricsWeek",
        "test_project_id": 1,
    }

    id_last = create_test_report(payload_last, headers)
    id_curr = create_test_report(payload_curr, headers)

    r = client.get("/tests-per-week/", params={"project_id": 1}, headers=headers)
    assert r.status_code == 200, r.json()
    per_week = {item["week"]: item["count"] for item in r.json()}

    week_last_iso = (last_week - timedelta(days=last_week.weekday())).date().isoformat() + "T00:00:00"
    week_curr_iso = (now - timedelta(days=now.weekday())).date().isoformat() + "T00:00:00"

    assert week_last_iso in per_week
    assert week_curr_iso in per_week

    delete_test_report(id_last, headers)
    delete_test_report(id_curr, headers)

def test_metrics_error_types():
    """
    1. create two FAIL steps with distinct error messages
    2. query /error-types-metrics
    3. ensure both errors are counted
    """
    headers = get_admin_headers()
    now = datetime.now(timezone.utc)

    payload_error_a = {
        "test_name": "ErrorMetric_A",
        "status": "FAIL",
        "execution_time": 2,
        "timestamp": now.isoformat(),
        "steps": [
            _make_step("FAIL", "element click intercepted: other element would receive the click")
        ],
        "test_suite_id": None,
        "test_suite_name": "ErrorMetricsSuite",
        "test_project_id": 1,
    }
    payload_error_b = {
        "test_name": "ErrorMetric_B",
        "status": "FAIL",
        "execution_time": 2,
        "timestamp": now.isoformat(),
        "steps": [
            _make_step("FAIL", "Message: Timeout waiting for element")
        ],
        "test_suite_id": None,
        "test_suite_name": "ErrorMetricsSuite",
        "test_project_id": 1,
    }

    id_a = create_test_report(payload_error_a, headers)
    id_b = create_test_report(payload_error_b, headers)

    r = client.get("/error-types-metrics/", params={"project_id": 1}, headers=headers)
    assert r.status_code == 200, r.json()
    metrics = r.json()

    labels = metrics["labels"]
    assert any("element click intercepted" in lbl for lbl in labels)
    assert any("Timeout waiting for element".split()[0] in lbl for lbl in labels)

    # cleanup
    delete_test_report(id_a, headers)
    delete_test_report(id_b, headers)
