# Prepare Deployment Package
# Creates a ready-to-upload package from build directory

$BuildDir = "dist"
$OutputZip = "deployment-package.zip"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Preparing Deployment Package" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if build directory exists
if (-not (Test-Path $BuildDir)) {
    Write-Host "❌ Build directory not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

# Ensure .htaccess is in build directory
if (Test-Path "public\.htaccess") {
    Write-Host "📄 Copying .htaccess to build directory..." -ForegroundColor Yellow
    Copy-Item "public\.htaccess" -Destination "$BuildDir\.htaccess" -Force
}

# Create deployment package (ZIP file)
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Remove old package if exists
if (Test-Path $OutputZip) {
    Remove-Item $OutputZip -Force
}

# Create ZIP file
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($BuildDir, $OutputZip)

$ZipSize = (Get-Item $OutputZip).Length / 1MB
$ZipSizeRounded = [math]::Round($ZipSize, 2)
Write-Host "✅ Package created: $OutputZip" -ForegroundColor Green
Write-Host "   Size: $ZipSizeRounded MB" -ForegroundColor Gray
Write-Host ""

# List files to be deployed
Write-Host "📁 Files ready for deployment:" -ForegroundColor Cyan
Get-ChildItem -Path $BuildDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace((Resolve-Path $BuildDir).Path + "\", "")
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "   $relativePath ($size KB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Deployment Package Ready!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📤 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Upload $OutputZip to Hostinger File Manager" -ForegroundColor White
Write-Host "   2. Extract to /public_html/app/" -ForegroundColor White
Write-Host "   3. Or upload files from build/ directory directly" -ForegroundColor White
Write-Host ""
Write-Host "📖 See DEPLOYMENT_MANUAL.md for detailed instructions" -ForegroundColor Cyan

