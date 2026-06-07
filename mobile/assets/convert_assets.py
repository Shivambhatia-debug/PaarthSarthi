import os
from PIL import Image

assets_dir = r"c:\Users\shiva\ParthSarthi Project\mobile\assets"
logo_path = os.path.join(assets_dir, "logo.jpg")

if not os.path.exists(logo_path):
    print("logo.jpg not found!")
    exit(1)

# Open the JPEG image
img = Image.open(logo_path)

# Convert and save as proper PNGs
targets = ["icon.png", "splash-icon.png", "android-icon-foreground.png"]

for target in targets:
    target_path = os.path.join(assets_dir, target)
    img.save(target_path, "PNG")
    print(f"Successfully converted and saved {target_path} as PNG")

print("All conversions complete!")
