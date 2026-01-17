#!/bin/bash

# Deploy via cURL (FTP)
# Alternative deployment method using cURL

FTP_HOST="${SFTP_HOST:-${FTP_HOST:-ftp.sublimesdrive.com}}"
FTP_USER="${SFTP_USERNAME:-${FTP_USER:-u827579338.appsublimesdrive}}"
FTP_PASS="${SFTP_PASSWORD:-${FTP_PASSWORD:-${FTP_PASS:-}}}"
REMOTE_PATH="${SFTP_REMOTE_PATH:-${REMOTE_PATH:-/public_html/app}}"
BUILD_DIR="${SFTP_LOCAL_PATH:-${BUILD_DIR:-dist}}"

if [ -z "$FTP_PASS" ]; then
    echo "❌ Missing deployment password."
    echo "Set SFTP_PASSWORD (recommended) or FTP_PASSWORD / FTP_PASS, then re-run."
    exit 1
fi

echo "═══════════════════════════════════════"
echo "  Deploying via cURL (FTP)"
echo "═══════════════════════════════════════"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found!"
    echo "Please run 'npm run build' first"
    exit 1
fi

# Ensure .htaccess is in build directory
if [ -f "public/.htaccess" ]; then
    echo "📄 Copying .htaccess to build directory..."
    cp public/.htaccess "$BUILD_DIR/.htaccess"
fi

echo "📤 Uploading files via FTP..."
echo ""

uploaded=0
failed=0

# Upload all files
cd "$BUILD_DIR"
find . -type f | while read -r file; do
    # Remove leading ./
    relative_path="${file#./}"
    remote_path="$REMOTE_PATH/$relative_path"
    
    # Upload using curl
    if curl -T "$file" --ftp-ssl --insecure --user "$FTP_USER:$FTP_PASS" "ftp://${FTP_HOST}${remote_path}" --silent --show-error; then
        echo "   ✅ $relative_path"
        ((uploaded++))
    else
        echo "   ❌ $relative_path"
        ((failed++))
    fi
done
cd ..

echo ""
echo "═══════════════════════════════════════"
if [ $failed -eq 0 ]; then
    echo "✅ Deployment complete!"
    echo "   Uploaded: $uploaded files"
    echo "🌐 Visit: https://app.sublimesdrive.com"
else
    echo "⚠️  Deployment completed with errors"
    echo "   Uploaded: $uploaded files"
    echo "   Failed: $failed files"
    echo ""
    echo "💡 Try manual upload via File Manager instead"
fi
echo "═══════════════════════════════════════"






