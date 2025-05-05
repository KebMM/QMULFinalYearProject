import time

test_logs = []
component_names = []

def log_test_step(step_description, step_status="PASS", error_message=None):
    """
    test_Logs an individual test step with status and optional error message.
    """
    global test_logs, component_names
    step_number = len(test_logs) + 1
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())
    if step_status.upper() == "PASS" and error_message is None:
        if component_names:
            error_message = "Components used: " + ", ".join(component_names)
        else:
            error_message = "Step executed successfully"

    # append the test step details to test_log
    test_logs.append({
        "step_number": step_number,
        "step_description": step_description,
        "step_status": step_status,
        "error_message": error_message,
        "timestamp": timestamp
    })
    component_names.clear()

def clear_test_logs():
    global test_logs
    test_logs.clear()
