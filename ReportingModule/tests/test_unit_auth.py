# Unit tests around authentication

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_admin_auth_headers():
    login_data = {"username": "TestAdmin", "password": "password123"}
    response = client.post("/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_register_success():
    payload = {
        "username": "unitregister3",
        "password": "testpassword",
        "role": "user"
    }
    response = client.post("/register", json=payload)
    assert response.status_code == 200, f"Response status: {response.status_code}"
    data = response.json()
    assert data["username"] == payload["username"]
    user_id = data["id"]

    headers = get_admin_auth_headers()
    delete_response = client.delete(f"/users/{user_id}", headers=headers)
    assert delete_response.status_code == 200
    deleted_data = delete_response.json()
    assert deleted_data["id"] == user_id

def test_register_duplicate():
    payload = {
        "username": "duplicateuser3",
        "password": "testpassword",
        "role": "user"
    }
    response = client.post("/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    user_id = data["id"]

    # Attempt to register the same user again
    response_dup = client.post("/register", json=payload)
    assert response_dup.status_code == 400
    data = response_dup.json()
    assert data["detail"] == "Username already registered"

    headers = get_admin_auth_headers()
    delete_response = client.delete(f"/users/{user_id}", headers=headers)
    assert delete_response.status_code == 200
    deleted_data = delete_response.json()
    assert deleted_data["id"] == user_id

def test_login_success():
    login_data = {
        "username": "TestAdmin",
        "password": "password123"
    }
    response = client.post("/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_fail():
    # Attempt login with invalid credentials
    login_data = {
        "username": "fakeuser",
        "password": "wrongpassword"
    }
    response = client.post("/login", data=login_data)
    assert response.status_code == 401
