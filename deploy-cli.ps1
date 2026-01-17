# Sublimes Drive - CLI Deployment Script (PowerShell)
# Deploys built files to shared hosting via FTP

# Configuration (DO NOT hardcode credentials)
# Prefer SFTP_* env vars (shared with deploy.js), but allow FTP_* for backwards compatibility.
$FTP_HOST = $env:SFTP_HOST
if (-not $FTP_HOST) { $FTP_HOST = $env:FTP_HOST }
if (-not $FTP_HOST) { $FTP_HOST = "ftp.sublimesdrive.com" }

$FTP_USER = $env:SFTP_USERNAME
if (-not $FTP_USER) { $FTP_USER = $env:FTP_USER }
if (-not $FTP_USER) { $FTP_USER = "u827579338.appsublimesdrive" }

$FTP_PASS = $env:SFTP_PASSWORD
if (-not $FTP_PASS) { $FTP_PASS = $env:FTP_PASSWORD }
if (-not $FTP_PASS) { $FTP_PASS = $env:FTP_PASS }

$FTP_PORT = $env:SFTP_PORT
if (-not $FTP_PORT) { $FTP_PORT = $env:FTP_PORT }
if (-not $FTP_PORT) { $FTP_PORT = "21" }

$REMOTE_PATH = $env:SFTP_REMOTE_PATH
if (-not $REMOTE_PATH) { $REMOTE_PATH = $env:REMOTE_PATH }
if (-not $REMOTE_PATH) { $REMOTE_PATH = "/public_html/app" }

$BUILD_DIR = $env:SFTP_LOCAL_PATH
if (-not $BUILD_DIR) { $BUILD_DIR = $env:BUILD_DIR }
if (-not $BUILD_DIR) { $BUILD_DIR = "dist" }

if (-not $FTP_PASS) {
    Write-Host "❌ Missing deployment password." -ForegroundColor Red
    Write-Host "Set one of these environment variables:" -ForegroundColor Yellow
    Write-Host "  - SFTP_PASSWORD (recommended)" -ForegroundColor White
    Write-Host "  - FTP_PASSWORD" -ForegroundColor White
    Write-Host "  - FTP_PASS" -ForegroundColor White
    exit 1
}

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Sublimes Drive - Deployment Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if build directory exists
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "📦 Build directory not found. Building project..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Check if lftp is installed
$lftpExists = Get-Command lftp -ErrorAction SilentlyContinue
if (-not $lftpExists) {
    Write-Host "❌ lftp is not installed!" -ForegroundColor Red
    Write-Host "Install it with:" -ForegroundColor Yellow
    Write-Host "  choco install lftp" -ForegroundColor White
    Write-Host "  Or download from: https://lftp.yar.ru/" -ForegroundColor White
    exit 1
}

# Step 3: Copy .htaccess to build directory if it exists
if (Test-Path "public\.htaccess") {
    Write-Host "📄 Copying .htaccess to build directory..." -ForegroundColor Yellow
    Copy-Item "public\.htaccess" -Destination "$BUILD_DIR\.htaccess" -Force
}

# Step 4: Deploy using lftp
Write-Host "📤 Deploying to $FTP_HOST..." -ForegroundColor Yellow
Write-Host "   Remote path: $REMOTE_PATH" -ForegroundColor Yellow
Write-Host ""

# Escape $ in password for PowerShell
$FTP_PASS_ESCAPED = $FTP_PASS -replace '\$', '`$'

$lftpCommand = @"
set ftp:passive-mode true;
set ssl:verify-certificate no;
set ftp:list-options -a;
open -u $FTP_USER,$FTP_PASS_ESCAPED ftp://${FTP_HOST}:${FTP_PORT};
cd $REMOTE_PATH;
mirror -R --delete --verbose --exclude-glob .git --exclude-glob node_modules $BUILD_DIR/ .;
bye
"@

lftp -c $lftpCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app is live at: https://app.sublimesdrive.com" -ForegroundColor Green
    Write-Host ""
    
    # Verification
    Write-Host "🔍 Verifying deployment..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "https://app.sublimesdrive.com" -Method Head -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site is accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not verify site (may need a few minutes to propagate)" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - FTP credentials are correct" -ForegroundColor White
    Write-Host "  - Server is accessible" -ForegroundColor White
    Write-Host "  - Remote directory exists" -ForegroundColor White
    exit 1
}






