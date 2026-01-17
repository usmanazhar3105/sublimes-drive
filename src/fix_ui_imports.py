#!/usr/bin/env python3
"""
Fix all versioned imports in UI components
Removes @version specifiers from package imports
"""

import re
import os
from pathlib import Path

# Pattern to match versioned imports
PATTERNS = [
    (r'@radix-ui/react-accordion@[\d.]+', '@radix-ui/react-accordion'),
    (r'@radix-ui/react-alert-dialog@[\d.]+', '@radix-ui/react-alert-dialog'),
    (r'@radix-ui/react-aspect-ratio@[\d.]+', '@radix-ui/react-aspect-ratio'),
    (r'@radix-ui/react-avatar@[\d.]+', '@radix-ui/react-avatar'),
    (r'@radix-ui/react-checkbox@[\d.]+', '@radix-ui/react-checkbox'),
    (r'@radix-ui/react-collapsible@[\d.]+', '@radix-ui/react-collapsible'),
    (r'@radix-ui/react-context-menu@[\d.]+', '@radix-ui/react-context-menu'),
    (r'@radix-ui/react-dialog@[\d.]+', '@radix-ui/react-dialog'),
    (r'@radix-ui/react-dropdown-menu@[\d.]+', '@radix-ui/react-dropdown-menu'),
    (r'@radix-ui/react-hover-card@[\d.]+', '@radix-ui/react-hover-card'),
    (r'@radix-ui/react-label@[\d.]+', '@radix-ui/react-label'),
    (r'@radix-ui/react-menubar@[\d.]+', '@radix-ui/react-menubar'),
    (r'@radix-ui/react-navigation-menu@[\d.]+', '@radix-ui/react-navigation-menu'),
    (r'@radix-ui/react-popover@[\d.]+', '@radix-ui/react-popover'),
    (r'@radix-ui/react-progress@[\d.]+', '@radix-ui/react-progress'),
    (r'@radix-ui/react-radio-group@[\d.]+', '@radix-ui/react-radio-group'),
    (r'@radix-ui/react-scroll-area@[\d.]+', '@radix-ui/react-scroll-area'),
    (r'@radix-ui/react-select@[\d.]+', '@radix-ui/react-select'),
    (r'@radix-ui/react-separator@[\d.]+', '@radix-ui/react-separator'),
    (r'@radix-ui/react-slider@[\d.]+', '@radix-ui/react-slider'),
    (r'@radix-ui/react-slot@[\d.]+', '@radix-ui/react-slot'),
    (r'@radix-ui/react-switch@[\d.]+', '@radix-ui/react-switch'),
    (r'@radix-ui/react-toggle-group@[\d.]+', '@radix-ui/react-toggle-group'),
    (r'@radix-ui/react-toggle@[\d.]+', '@radix-ui/react-toggle'),
    (r'@radix-ui/react-tooltip@[\d.]+', '@radix-ui/react-tooltip'),
    (r'lucide-react@[\d.]+', 'lucide-react'),
    (r'class-variance-authority@[\d.]+', 'class-variance-authority'),
    (r'react-day-picker@[\d.]+', 'react-day-picker'),
    (r'embla-carousel-react@[\d.]+', 'embla-carousel-react'),
    (r'recharts@[\d.]+', 'recharts'),
    (r'cmdk@[\d.]+', 'cmdk'),
    (r'vaul@[\d.]+', 'vaul'),
    (r'input-otp@[\d.]+', 'input-otp'),
    (r'react-resizable-panels@[\d.]+', 'react-resizable-panels'),
]

def fix_file(filepath):
    """Remove version specifiers from imports in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for pattern, replacement in PATTERNS:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Fix all UI component files"""
    ui_dir = Path('components/ui')
    if not ui_dir.exists():
        print(f"Error: {ui_dir} directory not found")
        return
    
    fixed_count = 0
    for filepath in ui_dir.glob('*.tsx'):
        if fix_file(filepath):
            print(f"✅ Fixed: {filepath}")
            fixed_count += 1
        else:
            print(f"⏭️  Skipped: {filepath} (no changes needed)")
    
    print(f"\n🎉 Fixed {fixed_count} files!")
    print("🔄 Please restart your development server")

if __name__ == '__main__':
    main()
