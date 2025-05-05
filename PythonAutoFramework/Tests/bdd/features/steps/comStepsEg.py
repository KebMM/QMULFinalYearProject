# Patch for collections.Mapping
import collections
if not hasattr(collections, 'Mapping'):
    import collections.abc
    collections.Mapping = collections.abc.Mapping

from behave import *
from selenium import webdriver
from selenium.webdriver.common.by import By
import logging
import importlib.util
import os

# Path to the commonUISteps.py
common_ui_steps_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../uiAutomation/commonUISteps.py'))

# Load the module
spec = importlib.util.spec_from_file_location("commonUISteps", common_ui_steps_path)
commonUISteps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(commonUISteps)

# Setup logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define global variable
driver = None

@given('the browser is open')
def step_impl(context):
    global driver
    driver = webdriver.Chrome()
    context.driver = driver

@when('we navigate to "{url}"')
def step_impl(context, url):
    commonUISteps.CommonUISteps.launch_web_browser(driver, url)

@then('the title should be "{title}"')
def step_impl(context, title):
    assert title in driver.title, f"Expected title to be '{title}', but got '{driver.title}'"

@when('we go to the "Products" page')
def step_impl(context):
    element = commonUISteps.CommonUISteps.wait_for_clickability(driver, (By.XPATH, "//*[@id='products']"), timeout=10)
    commonUISteps.CommonUISteps.click(element)

@when('we click the search bar and enter the product name')
def step_impl(context):
    commonUISteps.CommonUISteps.click((By.XPATH, "//*[@id='searchproduct']"))
    commonUISteps.CommonUISteps.send_text((By.XPATH, "//*[@id='searchproduct']"), "AirPods")

@when('we add the product to the basket')
def step_impl(context):
    element = commonUISteps.CommonUISteps.wait_for_clickability(driver, (By.XPATH, "//*[@id='root']/div/div/div[2]/div/div/div/div/div/a[2]"), timeout=10)
    commonUISteps.CommonUISteps.click(element)

@when('we go to the basket')
def step_impl(context):
    element = commonUISteps.CommonUISteps.wait_for_clickability(driver, (By.XPATH, "//*[@id='navbarNavAltMarkup']/div[2]/a[2]"), timeout=10)
    commonUISteps.CommonUISteps.click(element)

@then('the basket should contain the item')
def step_impl(context):
    text = commonUISteps.CommonUISteps.get_elements_text(driver, (By.XPATH, "/html/body/div[1]/div/div/div[2]/h5"))
    assert text[0] == "AirPods Pro", f"Expected item to be 'AirPods Pro', but got '{text[0]}'"
