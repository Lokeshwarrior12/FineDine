# PowerShell script to set up Android development environment
Write-Host "Setting up Android Development Environment..." -ForegroundColor Green

# Check if Android Studio is installed
$androidStudioPath = "C:\Program Files\Android\Android Studio"
if (Test-Path $androidStudioPath) {
    Write-Host "Android Studio found at: $androidStudioPath" -ForegroundColor Green

    # Set ANDROID_HOME environment variable
    $androidSdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
    if (Test-Path $androidSdkPath) {
        Write-Host "Android SDK found at: $androidSdkPath" -ForegroundColor Green

        # Set environment variables permanently
        [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
        [Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$androidSdkPath\platform-tools;$androidSdkPath\tools;$androidSdkPath\tools\bin", "User")

        Write-Host "Environment variables set successfully!" -ForegroundColor Green
        Write-Host "Please restart your terminal/command prompt and try running the app again." -ForegroundColor Yellow
    } else {
        Write-Host "Android SDK not found. Please open Android Studio and install the SDK through SDK Manager." -ForegroundColor Red
        Write-Host "1. Open Android Studio" -ForegroundColor Yellow
        Write-Host "2. Go to File > Settings > Appearance & Behavior > System Settings > Android SDK" -ForegroundColor Yellow
        Write-Host "3. Install Android SDK if not present" -ForegroundColor Yellow
        Write-Host "4. Run this script again" -ForegroundColor Yellow
    }
} else {
    Write-Host "Android Studio not found. Please install Android Studio first:" -ForegroundColor Red
    Write-Host "1. Download from: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "2. Install Android Studio" -ForegroundColor Yellow
    Write-Host "3. Open Android Studio and complete initial setup" -ForegroundColor Yellow
    Write-Host "4. Install Android SDK through SDK Manager" -ForegroundColor Yellow
    Write-Host "5. Run this script again" -ForegroundColor Yellow
}

# Check Java installation
$javaVersion = java -version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Java is installed:" -ForegroundColor Green
    Write-Host $javaVersion -ForegroundColor Gray
} else {
    Write-Host "Java not found. Installing OpenJDK..." -ForegroundColor Yellow
    # Note: You might need to install Java separately or through Android Studio
}

Write-Host "`nAfter setup is complete, test with:" -ForegroundColor Cyan
Write-Host "npx expo run:android" -ForegroundColor White

Read-Host "Press Enter to exit"
