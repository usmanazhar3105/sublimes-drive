#!/bin/bash

# Prepare Deployment Package
# Creates a ready-to-upload package from build directory

BUILD_DIR="dist"
OUTPUT_ZIP="deployment-package.zip"

echo "═══════════════════════════════════════"
echo "  Preparing Deployment Package"
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
    cp public/.htaccess build/.htaccess
fi

# Create deployment package (ZIP file)
echo "📦 Creating deployment package..."

# Remove old package if exists
if [ -f "$OUTPUT_ZIP" ]; then
    rm -f "$OUTPUT_ZIP"
fi

# Create ZIP file
cd "$BUILD_DIR"
zip -r "../$OUTPUT_ZIP" . -q
cd ..

ZIP_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
echo "✅ Package created: $OUTPUT_ZIP ($ZIP_SIZE)"
echo ""

# List files to be deployed
echo "📁 Files ready for deployment:"
find "$BUILD_DIR" -type f | while read file; do
    relative_path=${file#$BUILD_DIR/}
    size=$(du -h "$file" | cut -f1)
    echo "   $relative_path ($size)"
done

echo ""
echo "═══════════════════════════════════════"
echo "  Deployment Package Ready!"
echo "═══════════════════════════════════════"
echo ""
echo "📤 Next Steps:"
echo "   1. Upload $OUTPUT_ZIP to Hostinger File Manager"
echo "   2. Extract to /public_html/app/"
echo "   3. Or upload files from build/ directory directly"
echo ""
echo "📖 See DEPLOYMENT_MANUAL.md for detailed instructions"






