from PIL import Image

def recolor_png(input_path, output_path, new_rgb):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # item is (R, G, B, A)
        # If the pixel is not fully transparent, change its RGB to new_rgb
        if item[3] > 0:
            new_data.append((new_rgb[0], new_rgb[1], new_rgb[2], item[3]))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

recolor_png('public/assets/tov-logo-full-terracotta-alpha.png', 'public/assets/tov-logo-pine.png', (28, 45, 34))
print("Successfully generated tov-logo-pine.png")
