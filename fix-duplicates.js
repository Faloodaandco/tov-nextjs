const fs = require('fs');
const path = require('path');
function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let original = content;
            
            // Remove the first aria-label if there are two in the same tag
            content = content.replace(/<(button|a)\s+aria-label="[^"]+"([^>]*?aria-label=[^>]*?)>/gs, '<$1$2>');
            
            // Or specifically remove aria-label="Button" if there's another aria-label afterwards in the same tag
            content = content.replace(/ aria-label="[^"]+"([\s\S]*?aria-label="[^"]+")/g, (match, p1) => {
                 // only if within the same tag (no > between)
                 if (!p1.includes('>')) {
                      return p1; // remove the first aria-label
                 }
                 return match;
            });
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log('Fixed ' + fullPath);
            }
        }
    }
}
processDir(path.join(process.cwd(), 'src'));
