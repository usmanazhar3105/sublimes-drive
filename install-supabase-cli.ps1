# Install Supabase CLI on Windows
Write-Host "🔧 Installing Supabase CLI..." -ForegroundColor Cyan

# Create temp directory
$tempDir = "$env:TEMP\supabase-install"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Download Supabase CLI
Write-Host "`n📥 Downloading Supabase CLI..." -ForegroundColor Yellow
$downloadUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip"
$zipPath = "$tempDir\supabase.zip"
$exePath = "$tempDir\supabase.exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "✅ Download complete" -ForegroundColor Green
    
    # Extract
    Write-Host "`n📦 Extracting..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
    
    # Check if extracted
    if (Test-Path $exePath) {
        Write-Host "✅ Extraction complete" -ForegroundColor Green
        
        # Add to PATH (user-level)
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        $supabaseDir = "$env:USERPROFILE\.supabase"
        New-Item -ItemType Directory -Force -Path $supabaseDir | Out-Null
        
        # Copy to user directory
        Copy-Item $exePath -Destination "$supabaseDir\supabase.exe" -Force
        
        # Add to PATH if not already there
        if ($userPath -notlike "*$supabaseDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$userPath;$supabaseDir", "User")
            Write-Host "✅ Added to PATH" -ForegroundColor Green
        }
        
        # Refresh PATH in current session
        $env:Path += ";$supabaseDir"
        
        Write-Host "`n🎉 Supabase CLI installed successfully!" -ForegroundColor Green
        Write-Host "`nLocation: $supabaseDir\supabase.exe" -ForegroundColor Cyan
        Write-Host "`n⚠️  You may need to restart PowerShell for PATH changes to take effect." -ForegroundColor Yellow
        Write-Host "`nTesting installation..." -ForegroundColor Yellow
        
        # Test
        & "$supabaseDir\supabase.exe" --version
    } else {
        Write-Host "❌ Failed to extract Supabase CLI" -ForegroundColor Red
        Write-Host "Please download manually from: https://github.com/supabase/cli/releases" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    Write-Host "`nAlternative: Use Supabase Dashboard method (see STEP_1_SUPABASE_SECRETS.md)" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue












