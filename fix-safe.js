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
            
            // Only add aria-label if the entire tag does NOT contain "aria-label="
            content = content.replace(/<(button|a)([^>]*)>/g, (match, p1, p2) => {
                if (!p2.includes('aria-label=')) {
                    if (p1 === 'button') {
                        return `<button aria-label="Button"${p2}>`;
                    } else if (p1 === 'a') {
                        // let's not add 'Button' to 'a', but maybe based on href
                        if (p2.includes('instagram')) return `<a aria-label="Instagram"${p2}>`;
                        if (p2.includes('facebook')) return `<a aria-label="Facebook"${p2}>`;
                        if (p2.includes('wa.me')) return `<a aria-label="WhatsApp"${p2}>`;
                        if (p2.includes('tel:')) return `<a aria-label="Phone"${p2}>`;
                        if (p2.includes('mailto:')) return `<a aria-label="Email"${p2}>`;
                        if (p2.includes('food.gov.uk')) return `<a aria-label="Food Hygiene Rating"${p2}>`;
                        if (p2.includes('marketricks')) return `<a aria-label="Marketricks"${p2}>`;
                        if (p2.includes('google.com/maps')) return `<a aria-label="Google Maps Directions"${p2}>`;
                        // otherwise leave it alone to avoid generic
                    }
                }
                return match;
            });
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf-8');
            }
        }
    }
}
processDir(path.join(process.cwd(), 'src'));
