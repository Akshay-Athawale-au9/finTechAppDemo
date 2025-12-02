# UI Test Fix for libasound2 Package Issue

## Problem Description
The UI tests were failing with the following error:
```
E: Package 'libasound2' has no installation candidate
Error: Process completed with exit code 100.
```

## Root Cause
The `libasound2` package has been updated in the Ubuntu repositories. In newer versions of Ubuntu (specifically Ubuntu 24.04/Noble), `libasound2` has been replaced with `libasound2t64`.

## Solution Applied
Updated all workflow files that install system dependencies for UI tests to use the correct package name:

### Files Modified
1. `.github/workflows/comprehensive-tests.yml` - Changed `libasound2` to `libasound2t64`
2. `.github/workflows/enhanced-comprehensive-tests.yml` - Changed `libasound2` to `libasound2t64`

### Specific Change
```yaml
# Before
sudo apt-get install -y libgtk-3-0 libgbm-dev libnss3-dev libasound2

# After
sudo apt-get install -y libgtk-3-0 libgbm-dev libnss3-dev libasound2t64
```

## Why This Fix Works
- `libasound2t64` is the updated version of the ALSA (Advanced Linux Sound Architecture) library
- It provides the same functionality as the older `libasound2` package
- Playwright and other UI testing tools require this library for audio support in headless browsers
- The `t64` suffix indicates it's built for 64-bit systems with thread safety

## Expected Result
After this fix, the UI tests should be able to successfully install all required system dependencies and proceed with running the tests without the package installation error.

This is a common issue when Ubuntu updates their package repositories, and keeping dependencies up-to-date with the current OS version is essential for CI/CD pipeline stability.