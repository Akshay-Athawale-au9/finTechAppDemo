# UI Tests

This directory contains UI tests for the fintech application using Playwright.

## Directory Structure

```
ui/
├── test_admin_ui.py     # Tests for the Admin Dashboard
├── conftest.py          # pytest configuration and fixtures
└── requirements.txt     # UI testing dependencies
```

## Prerequisites

1. Python 3.10+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   playwright install-deps
   playwright install chromium
   ```

## Running UI Tests

```bash
cd d:\Interview\fintechApplciaitioon\services\tests\ui
python -m pytest test_admin_ui.py -v
```

## Test Coverage

### Admin Dashboard Tests
1. `test_dashboard_loads_successfully` - Verifies the admin dashboard loads correctly
2. `test_toggle_mock_scenarios` - Tests toggling between different mock scenarios
3. `test_view_audit_logs` - Tests viewing audit logs in the dashboard
4. `test_check_system_health` - Tests checking system health status

## Headless vs Headed Mode

By default, tests run in headless mode. To run in headed mode for debugging, modify the [conftest.py](file://d:\Interview\fintechApplciaitioon\services\tests\ui\conftest.py) file:

```python
browser = p.chromium.launch(headless=False)  # Set to True for headless mode
```