const fs = require('fs');

const files = [
    'src/app/[locationId]/menu/page.tsx',
    'src/components/MenuCategoryNav.tsx',
    'src/components/Navbar.tsx',
    'src/components/PromoBanner.tsx'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    // We just remove all `aria-label="Button"` from these files, because it caused duplicates.
    // Or `aria-label="Close"`, `aria-label="Menu"`, etc.
    content = content.replace(/ aria-label="Button"/g, '');
    content = content.replace(/ aria-label="Close"/g, '');
    content = content.replace(/ aria-label="Menu"/g, '');
    
    // Specifically fix the exact tags:
    content = content.replace(/<button aria-label="[^"]+"/g, '<button');
    
    fs.writeFileSync(file, content);
}
