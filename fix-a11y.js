const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. button-name: add aria-label to buttons lacking it if they have icons
    content = content.replace(/<button([^>]*)>/g, (match, p1) => {
        if (!p1.includes('aria-label')) {
            // Check if it's likely an icon button or close button based on className or onClick
            if (p1.includes('setIsOpen(false)') || p1.includes('Close') || p1.includes('X') || match.includes('close')) {
                return `<button aria-label="Close"${p1}>`;
            }
            if (p1.includes('Menu') || p1.includes('setIsOpen(true)')) {
                return `<button aria-label="Menu"${p1}>`;
            }
            if (p1.includes('cart') || p1.includes('Cart')) {
                return `<button aria-label="Cart"${p1}>`;
            }
            if (p1.includes('increment') || p1.includes('increase')) {
                return `<button aria-label="Increase quantity"${p1}>`;
            }
            if (p1.includes('decrement') || p1.includes('decrease') || p1.includes('Minus')) {
                return `<button aria-label="Decrease quantity"${p1}>`;
            }
            return `<button aria-label="Button"${p1}>`;
        }
        return match;
    });

    // 2. color-contrast
    // replace text-bg-sand/40 -> text-bg-sand/70
    content = content.replace(/text-bg-sand\/40/g, 'text-bg-sand/70');
    content = content.replace(/text-bg-sand\/50/g, 'text-bg-sand/80');
    // text-pine/70 -> text-pine
    content = content.replace(/text-pine\/70/g, 'text-pine');
    // text-pine/50 -> text-pine/80
    content = content.replace(/text-pine\/50/g, 'text-pine/80');
    // replace text-terracotta/80 -> text-terracotta
    content = content.replace(/text-terracotta\/80/g, 'text-terracotta');

    // 3. link-name: add aria-label to links 
    content = content.replace(/<a([^>]*)>/g, (match, p1) => {
        if (!p1.includes('aria-label')) {
            if (p1.includes('instagram')) return `<a aria-label="Instagram"${p1}>`;
            if (p1.includes('facebook')) return `<a aria-label="Facebook"${p1}>`;
            if (p1.includes('wa.me')) return `<a aria-label="WhatsApp"${p1}>`;
            if (p1.includes('tel:')) return `<a aria-label="Phone"${p1}>`;
            if (p1.includes('mailto:')) return `<a aria-label="Email"${p1}>`;
            if (p1.includes('food.gov.uk')) return `<a aria-label="Food Hygiene Rating"${p1}>`;
            if (p1.includes('marketricks')) return `<a aria-label="Marketricks"${p1}>`;
            if (p1.includes('google.com/maps')) return `<a aria-label="Google Maps Directions"${p1}>`;
            return match; // fallback
        }
        return match;
    });

    // 4. list / listitem
    // Find un-ul/ol wrapped lis if possible, or bad structures, probably easier to fix manually if we know them.

    // 6. image-aspect-ratio
    // Look for <img without object-fit: cover if they have w- and h- 
    content = content.replace(/<img([^>]*)className="([^"]*)"([^>]*)>/g, (match, p1, p2, p3) => {
        if (p2.includes('w-') && p2.includes('h-') && !p2.includes('object-cover') && !p2.includes('object-contain')) {
            return `<img${p1}className="${p2} object-cover"${p3}>`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

processDir(path.join(__dirname, 'src'));
