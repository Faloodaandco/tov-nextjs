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
            
            // Regex to find tags with two aria-labels
            // <... aria-label="..." ... aria-label="..." ... >
            content = content.replace(/(<(?:button|a)[^>]*?)(aria-label="[^"]+")([^>]*?)(aria-label="[^"]+")([^>]*>)/g, (match, p1, p2, p3, p4, p5) => {
                // Keep the second one if the first one was added by us (like "Button" or "Close")
                // Or just keep the longer/more specific one. Actually, p4 is usually the original one.
                return `${p1}${p3}${p4}${p5}`;
            });
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log('Fixed duplicates in ' + fullPath);
            }
        }
    }
}
processDir(path.join(process.cwd(), 'src'));
