#!/usr/bin/env python3
"""
Test runner script for fintech microservices
"""

import subprocess
import sys
import argparse
import os


def run_unit_tests():
    """Run all unit tests"""
    print("Running unit tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", 
        "tests/python/test_*.py", 
        "-v", "--tb=short"
    ], cwd=os.path.join(os.path.dirname(__file__), ".."))
    return result.returncode == 0


def run_integration_tests():
    """Run all integration tests"""
    print("Running integration tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", 
        "tests/python/*integration.py", 
        "-v", "--tb=short"
    ], cwd=os.path.join(os.path.dirname(__file__), ".."))
    return result.returncode == 0


def run_all_tests():
    """Run all tests"""
    print("Running all tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", 
        "tests/python", 
        "-v", "--tb=short"
    ], cwd=os.path.join(os.path.dirname(__file__), ".."))
    return result.returncode == 0


def install_dependencies():
    """Install Python test dependencies"""
    print("Installing Python test dependencies...")
    result = subprocess.run([
        sys.executable, "-m", "pip", 
        "install", "-r", "tests/python/requirements.txt"
    ], cwd=os.path.join(os.path.dirname(__file__), ".."))
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description="Fintech Microservices Test Runner")
    parser.add_argument(
        "--unit", 
        action="store_true", 
        help="Run unit tests only"
    )
    parser.add_argument(
        "--integration", 
        action="store_true", 
        help="Run integration tests only"
    )
    parser.add_argument(
        "--all", 
        action="store_true", 
        help="Run all tests (default)"
    )
    parser.add_argument(
        "--install-deps", 
        action="store_true", 
        help="Install Python test dependencies"
    )
    
    args = parser.parse_args()
    
    # Install dependencies if requested
    if args.install_deps:
        if not install_dependencies():
            print("Failed to install dependencies")
            return 1
    
    # Run tests based on arguments
    if args.unit:
        success = run_unit_tests()
    elif args.integration:
        success = run_integration_tests()
    else:
        # Default to running all tests
        success = run_all_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())