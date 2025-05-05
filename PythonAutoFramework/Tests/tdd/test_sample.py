import pytest
import os
import sys
import importlib.util
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from reporting.api_client import send_test_result
from reporting.test_logger import log_test_step, clear_test_logs

# Path to the commonUISteps.py
common_ui_steps_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uiAutomation/commonUISteps.py'))

# Load the module
spec = importlib.util.spec_from_file_location("commonUISteps", common_ui_steps_path)
commonUISteps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(commonUISteps)

@pytest.fixture(scope="module")
def driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()


def test_demo(driver):
    start_time = time.time()
    test_name= "Showcase Test 6"
    test_project_id = 1
    test_suite_id = None
    test_suite_name= "Suite6"

    current_step = None

    try:
        current_step = "Launched browser"
        commonUISteps.CommonUISteps.launch_web_browser(driver, "https://practise.usemango.co.uk/")
        log_test_step(current_step, "PASS")

        current_step = "Go to 'Products' page"
        commonUISteps.CommonUISteps.click(driver, (By.XPATH, "//*[@id='products']"))
        log_test_step(current_step, "PASS")

        current_step = "Add laptop to basket"
        commonUISteps.CommonUISteps.click(driver, (By.XPATH, "//*[@id='root']/div/div/div[2]/div[4]/div/div/div/div/a[2]"))
        log_test_step(current_step, "PASS")

        current_step = "Click search bar and enter product name"
        element = commonUISteps.CommonUISteps.wait_for_clickability(driver, (By.XPATH, "//*[@id='searchproduct']"), timeout=10)
        commonUISteps.CommonUISteps.click(driver, (By.XPATH, "//*[@id='products']"))
        commonUISteps.CommonUISteps.send_text(element, "AirPods")
        log_test_step(current_step, "PASS")

        current_step = "Add AirPods to basket"
        commonUISteps.CommonUISteps.click(driver, (By.XPATH, "//*[@id='root']/div/div/div[2]/div/div/div/div/div/a[2]"))
        log_test_step(current_step, "PASS")

        current_step = "Go to basket"
        commonUISteps.CommonUISteps.click(driver, (By.XPATH, "//*[@id='navbarNavAltMarkup']/div[2]/a[2]"))
        log_test_step(current_step, "PASS")

        current_step = "Check item in basket"
        text = commonUISteps.CommonUISteps.get_elements_text(driver, (By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/h5"))
        assert text[0] == "AirPods Pro"
        log_test_step(current_step, "PASS")

        commonUISteps.CommonUISteps.wait_for(seconds=4)
        commonUISteps.CommonUISteps.scroll_to_bottom(driver)
        commonUISteps.CommonUISteps.click(driver, (By.XPATH, "//*[@id='root']/footer/div/div/div[1]/div/div[2]/a"))
        commonUISteps.CommonUISteps.wait_for(3)
        log_test_step(current_step, "PASS")

        test_status = "PASS"

    except Exception as e:
        test_status = "FAIL"
        log_test_step(current_step or "Unknown step", "FAIL", error_message=str(e))
    end_time = time.time()
    execution_time = round(end_time - start_time, 2)

    send_test_result(test_name, test_status, execution_time, test_project_id, test_suite_id, test_suite_name)

    clear_test_logs()
