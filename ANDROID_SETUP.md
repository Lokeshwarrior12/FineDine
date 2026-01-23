# Android Development Setup Guide

## Problem
You're getting errors when running `npx expo run:android` because the Android SDK is not installed or configured.

## Solution

### Step 1: Install Android Studio
1. Download Android Studio from: https://developer.android.com/studio
2. Run the installer and follow the setup wizard
3. Choose "Standard" installation type during setup
4. Wait for Android Studio to download and install the Android SDK

### Step 2: Configure Environment Variables
After installing Android Studio, run the setup script:

```powershell
# Open PowerShell as Administrator and run:
.\scripts\setup-android.ps1
```

Or manually set environment variables:

1. Open System Properties → Advanced → Environment Variables
2. Add new User variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\%USERNAME%\AppData\Local\Android\Sdk`
3. Edit the `Path` variable and add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

### Step 3: Verify Installation
Open a new Command Prompt/PowerShell and run:
```bash
echo %ANDROID_HOME%
adb version
```

You should see the Android SDK path and ADB version.

### Step 4: Accept Android SDK Licenses
```bash
# Navigate to Android SDK directory
cd %ANDROID_HOME%

# Accept all licenses
sdkmanager --licenses
```

### Step 5: Test the Project
```bash
npx expo run:android
```

## Alternative: Use Expo Go (Easier)
If you don't want to set up Android Studio, you can use Expo Go app:

1. Install Expo Go from Google Play Store on your Android device
2. Run: `npx expo start`
3. Scan the QR code with Expo Go app

## Troubleshooting

### Still getting "adb not found"?
- Restart your computer after setting environment variables
- Check that `%ANDROID_HOME%\platform-tools` is in your PATH

### Android Studio installed but SDK not found?
- Open Android Studio
- Go to File → Settings → Appearance & Behavior → System Settings → Android SDK
- Install Android SDK if missing

### Java errors?
Android Studio comes with its own Java installation. Make sure you're not using a conflicting Java version.

## Project Status
✅ Expo development server works
✅ Web version works
✅ iOS setup (when iOS SDK available)
❌ Android needs SDK setup (fixed with above steps)
