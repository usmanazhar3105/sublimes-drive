#!/bin/bash

# ⚡ EMERGENCY FIX - COPY THESE COMMANDS ONE BY ONE

echo "🔧 Step 1: Stop dev server (press Ctrl+C if running)"
echo ""

echo "🔧 Step 2: Clean install dependencies"
rm -rf node_modules package-lock.json
npm install
echo "✅ Dependencies installed"
echo ""

echo "🔧 Step 3: Backup current App.tsx"
cp App.tsx App_FULL_BACKUP_$(date +%Y%m%d_%H%M%S).tsx
echo "✅ Backup created"
echo ""

echo "🔧 Step 4: Use emergency diagnostic"
cp App_EMERGENCY_MINIMAL.tsx App.tsx
echo "✅ Emergency app activated"
echo ""

echo "🔧 Step 5: Start dev server"
npm run dev

echo ""
echo "=========================================="
echo "NOW:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Press F12 to open DevTools"
echo "3. Look at Console tab for errors"
echo "4. Report back what you see!"
echo "=========================================="
