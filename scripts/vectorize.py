import cv2
import numpy as np

def generate_svg():
    # Load the image with alpha channel
    img = cv2.imread('public/assets/tov-full-logo-transparent.png', cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Could not load image.")
        return

    # Extract alpha channel
    alpha = img[:, :, 3]

    # Threshold alpha to get a binary mask
    _, thresh = cv2.threshold(alpha, 128, 255, cv2.THRESH_BINARY)

    # Find contours
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # We will use RETR_CCOMP to get holes properly
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_L1)

    height, width = thresh.shape

    svg_paths = []
    
    # We need to build paths with holes.
    # hierarchy: [Next, Previous, First_Child, Parent]
    if hierarchy is not None:
        hierarchy = hierarchy[0]
        
        for i, c in enumerate(contours):
            # If it has no parent, it's an outer contour
            if hierarchy[i][3] == -1:
                path = []
                # Outer contour
                pts = c.reshape(-1, 2)
                if len(pts) > 0:
                    path.append("M {} {}".format(pts[0][0], pts[0][1]))
                    for p in pts[1:]:
                        path.append("L {} {}".format(p[0], p[1]))
                    path.append("Z")
                
                # Check for children (holes)
                child_idx = hierarchy[i][2]
                while child_idx != -1:
                    child_c = contours[child_idx]
                    pts = child_c.reshape(-1, 2)
                    if len(pts) > 0:
                        path.append("M {} {}".format(pts[0][0], pts[0][1]))
                        for p in pts[1:]:
                            path.append("L {} {}".format(p[0], p[1]))
                        path.append("Z")
                    child_idx = hierarchy[child_idx][0] # next sibling
                
                svg_paths.append(" ".join(path))

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
'''
    for path in svg_paths:
        svg_content += f'  <path d="{path}" fill="#1C2D22" fill-rule="evenodd" />\n'
    svg_content += '</svg>'

    with open('public/assets/tov-logo.svg', 'w') as f:
        f.write(svg_content)
    
    print("SVG generated successfully at public/assets/tov-logo.svg")

if __name__ == '__main__':
    generate_svg()
