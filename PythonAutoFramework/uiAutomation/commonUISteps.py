from behave import *
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import pyautogui
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.common.exceptions import NoAlertPresentException
from selenium.common.exceptions import NoSuchFrameException
from selenium.common.exceptions import NoSuchWindowException
import os
from datetime import datetime
import base64
import time
from PIL import Image
import numpy as np
import logging
from reporting.test_logger import component_names

class SimpleLogHandler(logging.Handler):
    def emit(self, record):
        print(record.getMessage())

# Setup logging configuration
logger = logging.getLogger('Text')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(handler)

def log_component(func):
    """
    Log the name of the component whenever it is called.
    """
    def wrapper(*args, **kwargs):
        component_names.append(func.__name__)
        return func(*args, **kwargs)
    return wrapper

class CommonUISteps:
    @staticmethod
    @log_component
    def launch_web_browser(driver, url):
        driver.get(url)

    @staticmethod
    @log_component
    def click(driver, locator, timeout=4):
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.element_to_be_clickable(locator))
        element.click()

    @staticmethod
    @log_component
    def send_text(element, text):
        element.send_keys(text)


    @staticmethod
    @log_component
    def get_elements_text(driver, locator):
        elements = driver.find_elements(*locator)
        elem_texts = [el.text for el in elements]
        for text in elem_texts:
            logger.info(text)
        return elem_texts

    @staticmethod
    @log_component
    def verify_element_displayed(context, locator, timeout=10):
        try:
            element = WebDriverWait(context.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            assert element.is_displayed(), f"Element is not displayed: {locator}"
            print(f"Element is displayed: {locator}")
        except NoSuchElementException as e:
            e.printStackTrace()
            assert False, f"Element not found: {locator}"
        except TimeoutException as e:
            assert False, f"Element is not displayed: {locator}"

    @staticmethod
    @log_component
    def verify_element_not_displayed(context, locator, timeout=5):
        try:
            WebDriverWait(context.driver, timeout).until(
                EC.invisibility_of_element_located(locator)
            )
            print(f"Element is not displayed: {locator}")
        except TimeoutException:
            assert False, f"Element is still displayed: {locator}"


    @staticmethod
    @log_component
    def scroll_to_element(context, element):
        context.driver.execute_script("arguments[0].scrollIntoView(true);", element)

    @staticmethod
    @log_component
    def scroll_to_bottom(driver):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    @staticmethod
    @log_component
    def scroll_to_top(driver):
        driver.execute_script("window.scrollTo(0, 0);")

    @staticmethod
    @log_component
    def wait_for(seconds):
        time.sleep(seconds)
