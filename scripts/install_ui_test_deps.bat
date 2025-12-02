@echo off
echo Installing UI test dependencies...

echo Installing Python packages...
pip install -r ..\services\tests\ui\requirements.txt

echo Installing Playwright browsers...
playwright install-deps
playwright install chromium

echo UI test dependencies installed successfully!
pause