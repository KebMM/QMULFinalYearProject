import requests
import time
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from reporting.test_logger import test_logs, clear_test_logs

API_URL = "http://127.0.0.1:8000/submit-test-result/"
LOGIN_URL = "http://127.0.0.1:8000/login"

def send_test_result(test_name, status, execution_time, test_project_id, test_suite_id, test_suite_name):
    """
    Sends test execution results to the reporting system API.
    """
    token = get_jwt_token("TestAdmin", "password123")
    if token is None:
        print("No token available, aborting send_test_result")
        return

    headers = {
        "Authorization": f"Bearer {token}"
    }

    test_result = {
        "test_name": test_name,
        "status": status,
        "execution_time": execution_time,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
        "test_project_id": test_project_id,
        "test_suite_id": test_suite_id,
        "test_suite_name": test_suite_name,
        "steps": test_logs if test_logs else []
    }

    try:
        response = requests.post(API_URL, json=test_result, headers=headers)
        response.raise_for_status()
        print(f"Test result sent successfully: {response.json()}")

        clear_test_logs()
    except requests.exceptions.RequestException as e:
        print(f"Failed to send test result: {e}")

def get_jwt_token(username: str, password: str) -> str:
    """
    Logs in using the provided credentials and returns the JWT token.
    """
    data = {
        "username": username,
        "password": password
    }
    try:
        response = requests.post(LOGIN_URL, data=data)
        response.raise_for_status()
        token = response.json().get("access_token")
        return token
    except requests.exceptions.RequestException as e:
        print(f"Failed to get JWT token: {e}")
        return None
