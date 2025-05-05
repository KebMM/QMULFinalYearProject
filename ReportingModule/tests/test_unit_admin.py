# Admin Unit tests

from fastapi.testclient import TestClient
from backend.app.main import app
import time

client = TestClient(app)

def get_admin_auth():
    login_data = {"username": "TestAdmin", "password": "password123"}
    r = client.post("/login", data=login_data)
    assert r.status_code == 200, r.json()
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def get_user_auth():
    login_data = {"username": "TestUser", "password": "password123"}
    r = client.post("/login", data=login_data)
    assert r.status_code == 200, r.json()
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

def create_temp_user(username: str, headers: dict, role: str = "user"):
    payload = {"username": username, "password": "tempPwd123", "role": role}
    response = client.post("/register", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    return data["id"]


def delete_user(user_id: int, headers: dict):
    r = client.delete(f"/users/{user_id}", headers=headers)
    assert r.status_code in (200, 404), r.json()


def create_project(project_name: str, headers: dict):
    payload = {"project_name": project_name}
    r = client.post("/projects/", json=payload, headers=headers)
    assert r.status_code == 200, r.json()
    return r.json()["id"]


def delete_project(project_id: int, headers: dict):
    r = client.delete(f"/projects/{project_id}", headers=headers)
    assert r.status_code in (200, 404), r.json()


def test_admin_edit_and_delete_user():
    admin_headers = get_admin_auth()

    suffix = int(time.time()*1000)
    user_id = create_temp_user(f"_tmp_{suffix}", admin_headers, role="user")

    patch_payload = {"role": "admin"}
    r = client.patch(f"/users/{user_id}/role",
                     json=patch_payload,
                     headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["role"] == "admin"

    delete_user(user_id, admin_headers)

    r = client.get(f"/admin/users/{user_id}", headers=admin_headers)
    assert r.status_code == 404


def test_non_admin_cannot_edit_or_delete_user():
    admin_headers = get_admin_auth()
    user_headers  = get_user_auth()

    user_id = create_temp_user(f"_tmp_{int(time.time()*1000)}", admin_headers)

    r = client.patch(f"/users/{user_id}/role",
                     json={"role": "admin"},
                     headers=user_headers)
    assert r.status_code == 403

    r = client.delete(f"/users/{user_id}", headers=user_headers)
    assert r.status_code == 403

    delete_user(user_id, admin_headers)

def test_admin_delete_project():
    admin_headers = get_admin_auth()

    project_id = create_project(f"TmpProj_{int(time.time()*1000)}", admin_headers)

    delete_project(project_id, admin_headers)

    resp = client.get("/projects/", headers=admin_headers)
    projects = resp.json()

    assert not any(p["id"] == project_id for p in projects)


def test_regular_user_cant_delete_project():
    admin_headers = get_admin_auth()
    user_headers  = get_user_auth()

    project_id = create_project(f"TmpProj_{int(time.time()*1000)}", admin_headers)

    r = client.delete(f"/projects/{project_id}", headers=user_headers)
    assert r.status_code == 403

    delete_project(project_id, admin_headers)

def test_admin_unassign_user_from_project():
    admin_headers = get_admin_auth()
    suffix = int(time.time()*1000)

    user_id    = create_temp_user(f"_tmp_{suffix}", admin_headers)
    project_id = create_project(f"TmpProj_{suffix}", admin_headers)

    r = client.post(f"/projects/{project_id}/assign-user/?user_id={user_id}",
                    headers=admin_headers)
    assert r.status_code == 200, r.json()

    r = client.delete(
        f"/users/{user_id}/projects?project_id={project_id}",
        headers=admin_headers,
    )
    assert r.status_code == 200, r.json()

    r = client.get(f"/users/{user_id}", headers=admin_headers)
    assert project_id not in [p["id"] for p in r.json().get("projects", [])]

    delete_project(project_id, admin_headers)
    delete_user(user_id, admin_headers)
