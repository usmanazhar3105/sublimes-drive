# Push to GitHub
$ErrorActionPreference = "Continue"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan

# Use credential helper
git config --global credential.helper wincred

# Push
git push https://github.com/usman24I3105/sublime-drive.git main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Please push manually or check credentials." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual push command:" -ForegroundColor Yellow
    Write-Host "git push https://github.com/usman24I3105/sublime-drive.git main" -ForegroundColor White
}







