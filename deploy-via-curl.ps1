# Deploy via cURL (FTP)
# Alternative deployment method using cURL

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

Write-Host "📤 Uploading files via FTP..." -ForegroundColor Yellow
Write-Host ""

$uploaded = 0
$failed = 0

# Function to upload a file
function Upload-File {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    $relativePath = $LocalPath.Replace((Resolve-Path $BUILD_DIR).Path + "\", "").Replace("\", "/")
    $fullRemotePath = "$REMOTE_PATH/$relativePath"
    
    try {
        $fileContent = [System.IO.File]::ReadAllBytes($LocalPath)
        $base64 = [Convert]::ToBase64String($fileContent)
        
        # Use curl to upload
        $curlArgs = @(
            "-T", $LocalPath,
            "--ftp-ssl",
            "--insecure",
            "--user", "$FTP_USER:$FTP_PASS",
            "ftp://${FTP_HOST}${fullRemotePath}"
        )
        
        $result = & curl @curlArgs 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $relativePath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ $relativePath - $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ $relativePath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Get all files
$files = Get-ChildItem -Path $BUILD_DIR -Recurse -File

Write-Host "Found $($files.Count) files to upload" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Resolve-Path $BUILD_DIR).Path + "\", "").Replace("\", "/")
    $remotePath = "$REMOTE_PATH/$relativePath"
    
    if (Upload-File -LocalPath $file.FullName -RemotePath $remotePath) {
        $uploaded++
    } else {
        $failed++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "   Uploaded: $uploaded files" -ForegroundColor Green
    Write-Host "🌐 Visit: https://app.sublimesdrive.com" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Deployment completed with errors" -ForegroundColor Yellow
    Write-Host "   Uploaded: $uploaded files" -ForegroundColor Green
    Write-Host "   Failed: $failed files" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try manual upload via File Manager instead" -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan






