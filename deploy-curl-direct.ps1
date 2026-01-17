# Direct cURL FTP Deployment
# Uses Windows built-in curl for FTP upload

$FTP_HOST = $env:SFTP_HOST
if (-not $FTP_HOST) { $FTP_HOST = $env:FTP_HOST }
if (-not $FTP_HOST) { $FTP_HOST = "ftp.sublimesdrive.com" }

$FTP_USER = $env:SFTP_USERNAME
if (-not $FTP_USER) { $FTP_USER = $env:FTP_USER }
if (-not $FTP_USER) { $FTP_USER = "u827579338.appsublimesdrive" }

$FTP_PASS = $env:SFTP_PASSWORD
if (-not $FTP_PASS) { $FTP_PASS = $env:FTP_PASSWORD }
if (-not $FTP_PASS) { $FTP_PASS = $env:FTP_PASS }

$REMOTE_PATH = $env:SFTP_REMOTE_PATH
if (-not $REMOTE_PATH) { $REMOTE_PATH = $env:REMOTE_PATH }
if (-not $REMOTE_PATH) { $REMOTE_PATH = "/public_html/app" }

$BUILD_DIR = $env:SFTP_LOCAL_PATH
if (-not $BUILD_DIR) { $BUILD_DIR = $env:BUILD_DIR }
if (-not $BUILD_DIR) { $BUILD_DIR = "dist" }

if (-not $FTP_PASS) {
    Write-Host "❌ Missing deployment password." -ForegroundColor Red
    Write-Host "Set SFTP_PASSWORD (recommended) or FTP_PASSWORD / FTP_PASS, then re-run." -ForegroundColor Yellow
    exit 1
}

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Deploying via cURL (FTP)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if build directory exists
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "❌ Build directory not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

# Ensure .htaccess is in build directory
if (Test-Path "public\.htaccess") {
    Write-Host "📄 Copying .htaccess to build directory..." -ForegroundColor Yellow
    Copy-Item "public\.htaccess" -Destination "$BUILD_DIR\.htaccess" -Force
}

Write-Host "📤 Uploading files to FTP server..." -ForegroundColor Yellow
Write-Host "   Host: $FTP_HOST" -ForegroundColor Gray
Write-Host "   Path: $REMOTE_PATH" -ForegroundColor Gray
Write-Host ""

$uploaded = 0
$failed = 0
$files = Get-ChildItem -Path $BUILD_DIR -Recurse -File
$totalFiles = $files.Count

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Resolve-Path $BUILD_DIR).Path + "\", "").Replace("\", "/")
    $remoteFile = "$REMOTE_PATH/$relativePath"
    
    # Create directory structure on FTP if needed
    $remoteDir = Split-Path $remoteFile -Parent
    if ($remoteDir -and $remoteDir -ne $REMOTE_PATH) {
        # Try to create directory (curl doesn't support mkdir directly, but FTP will create on upload)
    }
    
    Write-Host "   Uploading: $relativePath" -ForegroundColor Gray -NoNewline
    
    # Use curl to upload file
    $curlUrl = "ftp://${FTP_HOST}${remoteFile}"
    $curlArgs = @(
        "-T", "`"$($file.FullName)`"",
        "--user", "${FTP_USER}:${FTP_PASS}",
        "--ftp-ssl",
        "--insecure",
        "--ftp-create-dirs",
        $curlUrl
    )
    
    $result = & curl @curlArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $uploaded++
    } else {
        Write-Host " ❌ ($result)" -ForegroundColor Red
        $failed++
    }
    
    # Progress
    $percent = [math]::Round(($uploaded + $failed) / $totalFiles * 100, 1)
    Write-Progress -Activity "Uploading files" -Status "$($uploaded + $failed)/$totalFiles files" -PercentComplete $percent
}

Write-Progress -Activity "Uploading files" -Completed

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "   Uploaded: $uploaded files" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your app is live at:" -ForegroundColor Cyan
    Write-Host "   https://app.sublimesdrive.com" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Deployment completed with errors" -ForegroundColor Yellow
    Write-Host "   Uploaded: $uploaded files" -ForegroundColor Green
    Write-Host "   Failed: $failed files" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 If authentication failed, verify FTP credentials" -ForegroundColor Yellow
    Write-Host "   Or use manual upload via File Manager" -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

