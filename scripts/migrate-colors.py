#!/usr/bin/env python3
"""
Script to replace Colors. usage with themeColor across all files
"""

import os
import re
from pathlib import Path

# Mapping from Colors to themeColor
COLOR_MAPPINGS = {
    'Colors.white': 'themeColor4.bgColor(1)',
    'Colors.lightGray': 'themeColor5.bgColor(1)',
    'Colors.gray': 'themeColor3.bgColor(1)',
    'Colors.red': 'themeColor6.bgColor(1)',
    'Colors.green': 'themeColor7.bgColor(1)',
    'Colors.orange': 'themeColor11.bgColor(1)',
    'Colors.blue': 'themeColor2.bgColor(1)',
    'Colors.lightBlue': 'themeColor8.bgColor(1)',
    'Colors.primary': 'themeColor0.bgColor(1)',
    'Colors.secondary': 'themeColor1.bgColor(1)',
    'Colors.purple': 'themeColor9.bgColor(1)',
    'Colors.black': 'themeColor10.bgColor(1)',
    'Colors.darkGray': 'themeColor12.bgColor(1)',
    'Colors.darkBlue': 'themeColor13.bgColor(1)',
    'Colors.lightBlue2': 'themeColor14.bgColor(1)',
}

# For icon colors and text colors, use .color instead of .bgColor(1)
COLOR_PROPERTY_MAPPINGS = {
    'Colors.white': 'themeColor4.color',
    'Colors.lightGray': 'themeColor5.color',
    'Colors.gray': 'themeColor3.color',
    'Colors.red': 'themeColor6.color',
    'Colors.green': 'themeColor7.color',
    'Colors.orange': 'themeColor11.color',
    'Colors.blue': 'themeColor2.color',
    'Colors.lightBlue': 'themeColor8.color',
    'Colors.primary': 'themeColor0.color',
    'Colors.secondary': 'themeColor1.color',
    'Colors.purple': 'themeColor9.color',
    'Colors.black': 'themeColor10.color',
    'Colors.darkGray': 'themeColor12.color',
    'Colors.darkBlue': 'themeColor13.color',
    'Colors.lightBlue2': 'themeColor14.color',
}

def should_use_color_property(line):
    """Check if we should use .color instead of .bgColor(1)"""
    # Check for color property in styles or components
    return any(keyword in line for keyword in [
        'color:', 'tintColor:', 'Color:', 'borderColor:', 
        'shadowColor:', 'textShadowColor:'
    ])

def replace_colors_in_line(line):
    """Replace Colors. with appropriate themeColor"""
    original_line = line
    
    # Check if we should use .color or .bgColor(1)
    use_color_property = should_use_color_property(line)
    mappings = COLOR_PROPERTY_MAPPINGS if use_color_property else COLOR_MAPPINGS
    
    for old_color, new_color in mappings.items():
        if old_color in line:
            line = line.replace(old_color, new_color)
    
    return line

def update_imports(content):
    """Update import statements to include themeColor"""
    # Find existing import from Color.js
    import_pattern = r"import\s+{([^}]+)}\s+from\s+['\"]([^'\"]*Color)['\"]"
    match = re.search(import_pattern, content)
    
    if match:
        imports_str = match.group(1)
        path = match.group(2)
        
        # Remove Colors from imports if exists
        imports = [imp.strip() for imp in imports_str.split(',')]
        imports = [imp for imp in imports if imp != 'Colors']
        
        # Add necessary themeColors
        theme_colors_needed = set()
        for line in content.split('\n'):
            for i in range(15):
                if f'themeColor{i}' in line:
                    theme_colors_needed.add(f'themeColor{i}')
        
        # Combine imports
        all_imports = imports + sorted(list(theme_colors_needed))
        new_imports = ', '.join(all_imports)
        
        # Replace import statement
        old_import = match.group(0)
        new_import = f"import {{ {new_imports} }} from '{path}'"
        content = content.replace(old_import, new_import)
    
    return content

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file uses Colors
        if 'Colors.' not in content:
            return False
        
        # Replace Colors in all lines
        lines = content.split('\n')
        new_lines = [replace_colors_in_line(line) for line in lines]
        new_content = '\n'.join(new_lines)
        
        # Update imports
        new_content = update_imports(new_content)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated: {file_path}")
        return True
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function"""
    root_dir = Path(__file__).parent.parent
    
    # Find all JS/JSX files
    js_files = []
    for ext in ['**/*.js', '**/*.jsx']:
        js_files.extend(root_dir.glob(ext))
    
    # Exclude node_modules, .expo, etc.
    js_files = [
        f for f in js_files 
        if 'node_modules' not in str(f) and '.expo' not in str(f)
    ]
    
    print(f"Found {len(js_files)} JS/JSX files")
    print("Processing files...")
    
    updated_count = 0
    for file_path in js_files:
        if process_file(file_path):
            updated_count += 1
    
    print(f"\n✅ Complete! Updated {updated_count} files")

if __name__ == '__main__':
    main()
