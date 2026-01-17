#!/bin/bash

# This script removes version specifiers from all UI component imports
# Run this in your project root

echo "🔧 Fixing all UI component imports..."

# List of files to fix
files=(
  "components/ui/accordion.tsx"
  "components/ui/alert-dialog.tsx"
  "components/ui/alert.tsx"
  "components/ui/aspect-ratio.tsx"
  "components/ui/avatar.tsx"
  "components/ui/badge.tsx"
  "components/ui/breadcrumb.tsx"
  "components/ui/calendar.tsx"
  "components/ui/carousel.tsx"
  "components/ui/chart.tsx"
  "components/ui/checkbox.tsx"
  "components/ui/collapsible.tsx"
  "components/ui/command.tsx"
  "components/ui/context-menu.tsx"
  "components/ui/dropdown-menu.tsx"
  "components/ui/drawer.tsx"
  "components/ui/form.tsx"
  "components/ui/hover-card.tsx"
  "components/ui/input-otp.tsx"
  "components/ui/label.tsx"
  "components/ui/menubar.tsx"
  "components/ui/navigation-menu.tsx"
  "components/ui/pagination.tsx"
  "components/ui/popover.tsx"
  "components/ui/progress.tsx"
  "components/ui/radio-group.tsx"
  "components/ui/resizable.tsx"
  "components/ui/scroll-area.tsx"
  "components/ui/select.tsx"
  "components/ui/separator.tsx"
  "components/ui/sheet.tsx"
  "components/ui/sidebar.tsx"
  "components/ui/slider.tsx"
  "components/ui/switch.tsx"
  "components/ui/toggle-group.tsx"
  "components/ui/toggle.tsx"
  "components/ui/tooltip.tsx"
)

# Patterns to replace (package@version -> package)
patterns=(
  's/@radix-ui\/react-accordion@[0-9.]+/@radix-ui\/react-accordion/g'
  's/@radix-ui\/react-alert-dialog@[0-9.]+/@radix-ui\/react-alert-dialog/g'
  's/@radix-ui\/react-aspect-ratio@[0-9.]+/@radix-ui\/react-aspect-ratio/g'
  's/@radix-ui\/react-avatar@[0-9.]+/@radix-ui\/react-avatar/g'
  's/@radix-ui\/react-checkbox@[0-9.]+/@radix-ui\/react-checkbox/g'
  's/@radix-ui\/react-collapsible@[0-9.]+/@radix-ui\/react-collapsible/g'
  's/@radix-ui\/react-context-menu@[0-9.]+/@radix-ui\/react-context-menu/g'
  's/@radix-ui\/react-dialog@[0-9.]+/@radix-ui\/react-dialog/g'
  's/@radix-ui\/react-dropdown-menu@[0-9.]+/@radix-ui\/react-dropdown-menu/g'
  's/@radix-ui\/react-hover-card@[0-9.]+/@radix-ui\/react-hover-card/g'
  's/@radix-ui\/react-label@[0-9.]+/@radix-ui\/react-label/g'
  's/@radix-ui\/react-menubar@[0-9.]+/@radix-ui\/react-menubar/g'
  's/@radix-ui\/react-navigation-menu@[0-9.]+/@radix-ui\/react-navigation-menu/g'
  's/@radix-ui\/react-popover@[0-9.]+/@radix-ui\/react-popover/g'
  's/@radix-ui\/react-progress@[0-9.]+/@radix-ui\/react-progress/g'
  's/@radix-ui\/react-radio-group@[0-9.]+/@radix-ui\/react-radio-group/g'
  's/@radix-ui\/react-scroll-area@[0-9.]+/@radix-ui\/react-scroll-area/g'
  's/@radix-ui\/react-select@[0-9.]+/@radix-ui\/react-select/g'
  's/@radix-ui\/react-separator@[0-9.]+/@radix-ui\/react-separator/g'
  's/@radix-ui\/react-slider@[0-9.]+/@radix-ui\/react-slider/g'
  's/@radix-ui\/react-slot@[0-9.]+/@radix-ui\/react-slot/g'
  's/@radix-ui\/react-switch@[0-9.]+/@radix-ui\/react-switch/g'
  's/@radix-ui\/react-tabs@[0-9.]+/@radix-ui\/react-tabs/g'
  's/@radix-ui\/react-toggle-group@[0-9.]+/@radix-ui\/react-toggle-group/g'
  's/@radix-ui\/react-toggle@[0-9.]+/@radix-ui\/react-toggle/g'
  's/@radix-ui\/react-tooltip@[0-9.]+/@radix-ui\/react-tooltip/g'
  's/lucide-react@[0-9.]+/lucide-react/g'
  's/class-variance-authority@[0-9.]+/class-variance-authority/g'
  's/react-day-picker@[0-9.]+/react-day-picker/g'
  's/embla-carousel-react@[0-9.]+/embla-carousel-react/g'
  's/recharts@[0-9.]+/recharts/g'
  's/cmdk@[0-9.]+/cmdk/g'
  's/vaul@[0-9.]+/vaul/g'
  's/input-otp@[0-9.]+/input-otp/g'
  's/react-resizable-panels@[0-9.]+/react-resizable-panels/g'
)

# Apply all patterns to all files
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    for pattern in "${patterns[@]}"; do
      sed -i.bak "$pattern" "$file"
    done
    # Remove backup files
    rm -f "${file}.bak"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✅ All UI component imports fixed!"
echo "🔄 Please restart your dev server"
