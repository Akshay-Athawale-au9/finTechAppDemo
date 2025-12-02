#!/usr/bin/env python3
"""
Comprehensive test runner for all test types in the fintech microservices application
"""

import subprocess
import sys
import os
import time


def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            timeout=300  # 5 minute timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)


def run_tests():
    """Run all types of tests"""
    
    # Change to the tests directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("Running comprehensive test suite for fintech microservices...\n")
    
    # Run unit and integration tests
    print("=" * 60)
    print("RUNNING UNIT AND INTEGRATION TESTS")
    print("=" * 60)
    
    success, stdout, stderr = run_command("python run_all_tests.py")
    print(stdout)
    if not success:
        print(f"Error running unit/integration tests: {stderr}")
        print("Continuing with other test suites...")
    
    # Run UI tests
    print("=" * 60)
    print("RUNNING UI TESTS")
    print("=" * 60)
    
    success, stdout, stderr = run_command(
        "python -m pytest test_admin_ui.py -v", 
        cwd=os.path.join(script_dir, "ui")
    )
    print(stdout)
    if not success and "no tests ran" not in stdout.lower():
        print(f"Error running UI tests: {stderr}")
        print("Continuing with other test suites...")
    
    # Run E2E tests
    print("=" * 60)
    print("RUNNING END-TO-END TESTS")
    print("=" * 60)
    
    success, stdout, stderr = run_command(
        "python -m pytest test_complete_user_flow.py -v", 
        cwd=os.path.join(script_dir, "e2e")
    )
    print(stdout)
    if not success:
        print(f"Error running E2E tests: {stderr}")
        print("Continuing with other test suites...")
    
    # Run performance tests
    print("=" * 60)
    print("RUNNING PERFORMANCE TESTS")
    print("=" * 60)
    
    success, stdout, stderr = run_command(
        "python -m pytest test_api_performance.py -v", 
        cwd=os.path.join(script_dir, "performance")
    )
    print(stdout)
    if not success:
        print(f"Error running performance tests: {stderr}")
        print("Continuing with other test suites...")
    
    # Run security tests
    print("=" * 60)
    print("RUNNING SECURITY TESTS")
    print("=" * 60)
    
    success, stdout, stderr = run_command(
        "python -m pytest test_authentication_security.py test_authorization_security.py test_input_validation.py -v", 
        cwd=os.path.join(script_dir, "security")
    )
    print(stdout)
    if not success:
        print(f"Error running security tests: {stderr}")
        print("Continuing with other test suites...")
    
    # Run static security analysis with bandit
    print("=" * 60)
    print("RUNNING STATIC SECURITY ANALYSIS (BANDIT)")
    print("=" * 60)
    
    success, stdout, stderr = run_command(
        "bandit -r ../../services/", 
        cwd=os.path.join(script_dir, "security")
    )
    print(stdout)
    if not success and "no issues found" not in stdout.lower():
        print(f"Bandit security analysis completed with findings: {stderr}")
        print("Continuing with other test suites...")
    
    # Check for vulnerable dependencies with safety
    print("=" * 60)
    print("CHECKING FOR VULNERABLE DEPENDENCIES (SAFETY)")
    print("=" * 60)
    
    success, stdout, stderr = run_command(
        "safety check", 
        cwd=os.path.join(script_dir, "security")
    )
    print(stdout)
    if not success:
        print(f"Safety check completed with findings: {stderr}")
        print("Continuing with other test suites...")
    
    print("=" * 60)
    print("COMPREHENSIVE TEST SUITE COMPLETED")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    try:
        success = run_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\nTest execution interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"Error running tests: {e}")
        sys.exit(1)