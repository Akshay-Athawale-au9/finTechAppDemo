"""
pytest configuration for UI tests
"""

import pytest
import importlib


def pytest_configure(config):
    """Configure pytest and check for Playwright availability"""
    global sync_playwright, PLAYWRIGHT_AVAILABLE
    try:
        playwright_module = importlib.import_module('playwright.sync_api')
        sync_playwright = getattr(playwright_module, 'sync_playwright')
        PLAYWRIGHT_AVAILABLE = True
    except (ImportError, AttributeError):
        PLAYWRIGHT_AVAILABLE = False
        sync_playwright = None
        print("Playwright is not installed. UI tests will be skipped.")


@pytest.fixture(scope="session")
def browser():
    """Create a browser instance for UI tests"""
    if not PLAYWRIGHT_AVAILABLE:
        pytest.skip("Playwright not available")
    
    # This check ensures we only execute if Playwright is available
    if sync_playwright is not None:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)  # Set to False for debugging
            yield browser
            browser.close()
    else:
        # This shouldn't happen due to the skip above, but just in case
        pytest.skip("Playwright not available")


@pytest.fixture(scope="function")
def page(browser):
    """Create a new page for each test"""
    if not PLAYWRIGHT_AVAILABLE:
        pytest.skip("Playwright not available")
    
    # Assuming browser is valid since we would have skipped otherwise
    page = browser.new_page()
    yield page
    page.close()


@pytest.fixture(scope="session")
def admin_credentials():
    """Admin credentials for testing"""
    return {
        "username": "admin@example.com",
        "password": "admin123"
    }