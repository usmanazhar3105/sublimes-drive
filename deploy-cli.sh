#!/bin/bash

# Sublimes Drive - CLI Deployment Script
# Deploys built files to shared hosting via FTP

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (DO NOT hardcode credentials)
# Prefer SFTP_* env vars (shared with deploy.js), but allow FTP_* for backwards compatibility.
FTP_HOST="${SFTP_HOST:-${FTP_HOST:-ftp.sublimesdrive.com}}"
FTP_USER="${SFTP_USERNAME:-${FTP_USER:-u827579338.appsublimesdrive}}"
FTP_PASS="${SFTP_PASSWORD:-${FTP_PASSWORD:-${FTP_PASS:-}}}"
FTP_PORT="${SFTP_PORT:-${FTP_PORT:-21}}"
REMOTE_PATH="${SFTP_REMOTE_PATH:-${REMOTE_PATH:-/public_html/app}}"
BUILD_DIR="${SFTP_LOCAL_PATH:-${BUILD_DIR:-dist}}"

if [ -z "$FTP_PASS" ]; then
    echo -e "${RED}❌ Missing deployment password.${NC}"
    echo -e "${YELLOW}Set one of these environment variables:${NC}"
    echo -e "  - SFTP_PASSWORD (recommended)"
    echo -e "  - FTP_PASSWORD"
    echo -e "  - FTP_PASS"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Sublimes Drive - Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# Step 1: Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}📦 Build directory not found. Building project...${NC}"
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed!${NC}"
        exit 1
    fi
fi

# Step 2: Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo -e "${RED}❌ lftp is not installed!${NC}"
    echo -e "${YELLOW}Install it with:${NC}"
    echo -e "  macOS:   brew install lftp"
    echo -e "  Linux:   sudo apt-get install lftp"
    echo -e "  Windows: choco install lftp"
    exit 1
fi

# Step 3: Copy .htaccess to build directory if it exists
if [ -f "public/.htaccess" ]; then
    echo -e "${YELLOW}📄 Copying .htaccess to build directory...${NC}"
    cp public/.htaccess "$BUILD_DIR/.htaccess"
fi

# Step 4: Deploy using lftp
echo -e "${YELLOW}📤 Deploying to ${FTP_HOST}...${NC}"
echo -e "${YELLOW}   Remote path: ${REMOTE_PATH}${NC}\n"

lftp -c "
set ftp:passive-mode true;
set ssl:verify-certificate no;
set ftp:list-options -a;
open -u ${FTP_USER},${FTP_PASS} ftp://${FTP_HOST}:${FTP_PORT};
cd ${REMOTE_PATH};
mirror -R --delete --verbose --exclude-glob .git --exclude-glob node_modules ${BUILD_DIR}/ .;
bye
"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Your app is live at: https://app.sublimesdrive.com${NC}\n"
    
    # Verification
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    sleep 2
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://app.sublimesdrive.com)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Site is accessible (HTTP ${HTTP_CODE})${NC}"
    else
        echo -e "${YELLOW}⚠️  Site returned HTTP ${HTTP_CODE} (may need a few minutes to propagate)${NC}"
    fi
else
    echo -e "\n${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  - FTP credentials are correct"
    echo -e "  - Server is accessible"
    echo -e "  - Remote directory exists"
    exit 1
fi






