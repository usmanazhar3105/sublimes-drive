#!/usr/bin/env python3
"""
Fix all versioned imports in TypeScript/React files.
Removes version numbers from package imports (e.g., @radix-ui/react-dialog@1.1.6 -> @radix-ui/react-dialog)
"""

import os
import re
from pathlib import Path

# Define the root directory
ROOT_DIR = Path(__file__).parent

# Patterns to fix
PATTERNS = [
    # Radix UI packages
    (r'from\s+"@radix-ui/([^"]+)@[\d.]+', r'from "@radix-ui/\1'),
    (r'import\s+([^;]+)\s+from\s+"@radix-ui/([^"]+)@[\d.]+', r'import \1 from "@radix-ui/\2'),
    
    # lucide-react
    (r'from\s+"lucide-react@[\d.]+', r'from "lucide-react'),
    (r'import\s+([^;]+)\s+from\s+"lucide-react@[\d.]+', r'import \1 from "lucide-react'),
    
    # recharts
    (r'from\s+"recharts@[\d.]+', r'from "recharts'),
    (r'import\s+([^;]+)\s+from\s+"recharts@[\d.]+', r'import \1 from "recharts'),
    
    # vaul (drawer)
    (r'from\s+"vaul@[\d.]+', r'from "vaul'),
    (r'import\s+([^;]+)\s+from\s+"vaul@[\d.]+', r'import \1 from "vaul'),
    
    # react-hook-form (KEEP VERSION - it's required)
    # (r'from\s+"react-hook-form@[\d.]+', r'from "react-hook-form'),
    
    # input-otp
    (r'from\s+"input-otp@[\d.]+', r'from "input-otp'),
    (r'import\s+([^;]+)\s+from\s+"input-otp@[\d.]+', r'import \1 from "input-otp'),
    
    # class-variance-authority
    (r'from\s+"class-variance-authority@[\d.]+', r'from "class-variance-authority'),
    (r'import\s+([^;]+)\s+from\s+"class-variance-authority@[\d.]+', r'import \1 from "class-variance-authority'),
    
    # react-resizable-panels
    (r'from\s+"react-resizable-panels@[\d.]+', r'from "react-resizable-panels'),
    (r'import\s+([^;]+)\s+from\s+"react-resizable-panels@[\d.]+', r'import \1 from "react-resizable-panels'),
    
    # sonner
    (r'from\s+"sonner@[\d.]+', r'from "sonner'),
    (r'import\s+([^;]+)\s+from\s+"sonner@[\d.]+', r'import \1 from "sonner'),
]

def fix_file(file_path: Path) -> bool:
    """Fix versioned imports in a single file. Returns True if changes were made."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all patterns
        for pattern, replacement in PATTERNS:
            content = re.sub(pattern, replacement, content)
        
        # Check if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all TypeScript/React files."""
    files_fixed = 0
    files_checked = 0
    
    # Find all .tsx and .ts files
    for ext in ['**/*.tsx', '**/*.ts']:
        for file_path in ROOT_DIR.glob(ext):
            # Skip node_modules and other non-source directories
            if 'node_modules' in str(file_path) or '.git' in str(file_path):
                continue
            
            files_checked += 1
            if fix_file(file_path):
                files_fixed += 1
                print(f"✓ Fixed: {file_path.relative_to(ROOT_DIR)}")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Files checked: {files_checked}")
    print(f"  Files fixed: {files_fixed}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
