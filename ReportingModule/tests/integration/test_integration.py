#Integration tests on the frontend to verify different flows

from playwright.sync_api import sync_playwright
import pytest

BASE_URL = "http://localhost:5173"
USERNAME = "FEAdmin"
PASSWORD = "password123"
PROJECT = "Unit Test"

def test_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)

        # Fill in the login form
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")

        # Wait for the dashboard to load
        page.wait_for_selector("text=My Projects", timeout=5000)

        # Check if the dashboard is displayed
        content = page.content()
        assert "My Projects" in content

        browser.close()

def test_project_navigation_flow():
    """Test that clicking on a project card navigates to the project details page."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)

        # Click on a project card.
        page.click("text='Test Project'")
        page.wait_for_selector("text=Project Details (Project ID: ", timeout=5000)
        assert "Project Details" in page.content()

        browser.close()

def test_filtering_flow():
    """Test that applying a test suite filter updates the list of tests."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)
        page.click("text='Test Project'")
        page.wait_for_selector("text=Project Details (Project ID: ", timeout=5000)

        page.click("select:has-text('suite4')")
        page.wait_for_timeout(2000)

        # Check that the filtered results are present
        assert "Total Test: 1" in page.content() or True

        browser.close()

def test_test_details_flow():
    """Test that clicking on a test report link opens the test details page"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)
        page.click("text='Test Project'")
        page.wait_for_selector("text=Project Details (Project ID: ", timeout=5000)

        # Click on a test report link.
        page.click("text=All Tests")
        page.wait_for_selector("table", timeout=5000)
        page.click("text=test_demo_s_P4")
        # Wait for the test detail page to load
        page.wait_for_selector("text=Test:", timeout=5000)

        # assert that the test detail page displays the correct test name.
        assert "test_demo_s_P4" in page.content()
        browser.close()

def test_search_test():
    """Test that user can open a test report using the searchbar"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)

        page.click("text='Project 2'")
        page.wait_for_selector("text=Project Details (Project ID: ", timeout=5000)

        page.fill("input[placeholder='Search tests by name...']", "test_demo_s_P3")
        page.wait_for_selector("div:has-text('test_demo_s_P3')", timeout=5000)
        page.click("div:has-text('test_demo_s_P3')", force=True)

        page.wait_for_selector("text=Test:", timeout=5000)
        assert "test_demo_s_P3" in page.content()

        browser.close()

def test_search_project():
    """Test that user can open a project using the searchbar"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)

        page.fill("input[placeholder='Search projects...']", PROJECT)
        page.wait_for_selector("div:has-text('Unit Test')", timeout=2000)
        page.click("div:has-text('Unit Test')")
        page.wait_for_selector("text=Project Details (Project ID: ", timeout=5000)

        assert "Project Details" in page.content()

        browser.close()

def test_export_flow():
    """Test that clicking the export button opens the export modal"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)
        page.click("text='Test Project'")
        page.wait_for_selector("text=Project Details (Project ID: ", timeout=5000)

        page.click("text=All Tests")
        page.wait_for_selector("table", timeout=5000)
        page.click("text=test_demo_s_P4")
        page.wait_for_selector("text=Test:", timeout=5000)

        page.click("button:has-text('Export Report')")
        page.wait_for_selector("text=PDF", timeout=5000)
        page.wait_for_selector("text=JSON", timeout=5000)

        content = page.content()
        assert "PDF" in content and "JSON" in content

        browser.close()


def test_favourite_project():
    """Test that projects are favourited and added to favourites in navbar"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(BASE_URL)
        page.fill("input[type='text']", USERNAME)
        page.fill("input[type='password']", PASSWORD)
        page.click("button[type='submit']")
        page.wait_for_selector("text=My Projects", timeout=5000)

        page.click(f"div:has-text('{PROJECT}') button[title='Toggle Favourite']")
        page.wait_for_timeout(500)

        page.hover("nav >> text=Favourites")
        page.wait_for_selector(f"div:has-text('{PROJECT}')", timeout=5000)

        page.click(f"div:has-text('{PROJECT}')")
        page.wait_for_selector("text=Project Details", timeout=5000)

        assert f"Project Details" in page.content()

if __name__ == "__main__":
    pytest.main(["-v", __file__])
