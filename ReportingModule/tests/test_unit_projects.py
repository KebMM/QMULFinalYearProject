#Unit tests for Project endpoints

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_admin_auth():
    login_data = {"username": "TestAdmin", "password": "password123"}
    response = client.post("/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def get_user_auth():
    # Login as a regular user.
    login_data = {"username": "TestUser", "password": "password123"}
    response = client.post("/login", data=login_data)
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

def create_project(project_name: str, headers: dict):
    payload = {"project_name": project_name}
    response = client.post("/projects/", json=payload, headers=headers)
    assert response.status_code == 200, f"Failed to create project: {response.json()}"
    return response.json()["id"]

def delete_project(project_id: int, headers: dict):
    response = client.delete(f"/projects/{project_id}", headers=headers)
    assert response.status_code == 200, f"Failed to delete project: {response.json()}"

def test_admin_create_and_get_projects():
    admin_headers = get_admin_auth()
    project_name = "TestProjectUnit"
    project_id = create_project(project_name, admin_headers)

    response = client.get("/projects/", headers=admin_headers)
    projects = response.json()
    # Check that the newly created project is in the list
    assert any(proj["id"] == project_id for proj in projects)

    delete_project(project_id, admin_headers)

def test_user_get_assigned_projects_success():
    admin_headers = get_admin_auth()
    user_headers = get_user_auth()
    project_name = "UnitUserProjectTest2"
    project_id = create_project(project_name, admin_headers)

    assign_response = client.post(f"/projects/{project_id}/assign-user/?user_id=2", headers=admin_headers)
    assert assign_response.status_code == 200

    # As a regular user, get the projects assigned to them
    response = client.get("/projects/my", headers=user_headers)
    assigned_projects = response.json()
    assert any(proj["id"] == project_id for proj in assigned_projects)

    delete_project(project_id, admin_headers)

def test_user_get_unassigned_projects_fail():
    admin_headers = get_admin_auth()
    user_headers = get_user_auth()
    project_name = "UnassignedProjectTest2"
    project_id = create_project(project_name, admin_headers)

    # As a regular user, get the projects assigned to them
    response = client.get("/projects/my", headers=user_headers)
    assigned_projects = response.json()
    # Ensure the project is not in the list
    assert not any(proj["id"] == project_id for proj in assigned_projects)

    delete_project(project_id, admin_headers)
