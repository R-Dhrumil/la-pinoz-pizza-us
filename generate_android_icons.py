#!/usr/bin/env python3
"""
Generate properly sized Android app icons from the iOS icon.
This script resizes the 1024x1024 iOS icon to all required Android densities.
"""

from PIL import Image
import os

# Paths
IOS_ICON = "ios/frontend/Images.xcassets/AppIcon.appiconset/icon-1024@1x.png"
ANDROID_RES = "android/app/src/main/res"

# Android icon sizes for each density
ICON_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def create_rounded_icon(image, size):
    """Create a circular/rounded version of the icon."""
    # The image is already circular with transparency, so we just resize
    return image.resize((size, size), Image.Resampling.LANCZOS)

def generate_icons():
    """Generate all Android icon sizes from the iOS icon."""
    print(f"Loading iOS icon from: {IOS_ICON}")
    
    # Load the source icon
    source_icon = Image.open(IOS_ICON)
    
    # Generate icons for each density
    for density, size in ICON_SIZES.items():
        print(f"\nGenerating {density} icons ({size}x{size})...")
        
        # Create directory path
        icon_dir = os.path.join(ANDROID_RES, density)
        
        # Generate regular icon
        regular_icon = source_icon.resize((size, size), Image.Resampling.LANCZOS)
        regular_path = os.path.join(icon_dir, "ic_launcher.png")
        regular_icon.save(regular_path, "PNG", optimize=True)
        print(f"  [OK] Saved: {regular_path}")
        
        # Generate round icon (same as regular for this design)
        round_icon = create_rounded_icon(source_icon, size)
        round_path = os.path.join(icon_dir, "ic_launcher_round.png")
        round_icon.save(round_path, "PNG", optimize=True)
        print(f"  [OK] Saved: {round_path}")
    
    print("\n[SUCCESS] All Android icons generated successfully!")
    print("\nNext steps:")
    print("1. Update colors.xml to use a brand color for ic_launcher_background")
    print("2. Rebuild your Android app to see the new icons")

if __name__ == "__main__":
    generate_icons()
