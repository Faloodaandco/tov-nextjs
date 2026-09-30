import os
import re

def fix_buttons(content):
    # Regex to find buttons without aria-label and without children text (or just add aria-label if icon inside)
    # Actually, a simpler way is to find <button> or <a> and check if it has aria-label. 
    # But some have text inside. 
    pass

def fix_links(content):
    pass

def process_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Add logic

process_files(r'c:\Users\user\Desktop\tov-nextjs\src')
