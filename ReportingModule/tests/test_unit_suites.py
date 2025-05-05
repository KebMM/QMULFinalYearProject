#Unit tests for suite endpoints

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_admin_auth_headers():
    login_data = {"username": "TestAdmin", "password": "password123"}
    response = client.post("/login", data=login_data)
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

def test_create_test_suite():
    headers = get_admin_auth_headers()
    payload = {
        "suite_name": "UnitTestSuite2",
        "project_id": 3
    }
    response = client.post("/create-test-suite/", json=payload, headers=headers)
    assert response.status_code == 200, f"Response status: {response.status_code}"
    data = response.json()
    assert data["suite_name"] == payload["suite_name"]
    suite_id = data["id"]

    del_response = client.delete(f"/test-suites/{suite_id}", headers=headers)
    assert del_response.status_code == 200

def test_get_test_suites():
    headers = get_admin_auth_headers()
    payload = {
        "suite_name": "UnitSuiteGET",
        "project_id": 3
    }
    create_response = client.post("/create-test-suite/", json=payload, headers=headers)
    assert create_response.status_code == 200
    suite_data = create_response.json()
    suite_id = suite_data["id"]

    get_response = client.get("/test-suites", params={"project_id": 3}, headers=headers)
    assert get_response.status_code == 200
    suites = get_response.json()
    # Verify suite appears in the retrieved list
    assert any(suite["id"] == suite_id for suite in suites)

    del_response = client.delete(f"/test-suites/{suite_id}", headers=headers)
    assert del_response.status_code == 200

def test_delete_nonexistent_suite():
    headers = get_admin_auth_headers()
    # Attempt to delete a suite with a non-existent ID
    response = client.delete("/test-suites/0", headers=headers)
    assert response.status_code == 404
