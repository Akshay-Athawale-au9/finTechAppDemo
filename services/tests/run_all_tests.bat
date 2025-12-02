@echo off
echo Running all fintech microservices tests...
echo.

cd /d "d:\Interview\fintechApplciaitioon\services\tests"

echo Before running tests, make sure you have installed all dependencies:
echo   pip install -r python/requirements.txt
echo   pip install -r ui/requirements.txt
echo   pip install -r e2e/requirements.txt
echo   pip install -r performance/requirements.txt
echo   pip install -r security/requirements.txt
echo   playwright install
echo.

echo Also ensure all services are running:
echo   cd /d "d:\Interview\fintechApplciaitioon"
echo   docker-compose up -d
echo.

echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo Running comprehensive test suite...
python run_comprehensive_tests.py

echo.
echo Test execution completed.
pause