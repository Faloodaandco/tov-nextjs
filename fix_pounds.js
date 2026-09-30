const fs = require('fs');
const path = require('path');

const componentsToFix = [
  'src/components/CartDrawer.tsx',
  'src/components/SizePickerModal.tsx',
  'src/components/CustomisationModal.tsx',
  'src/components/MenuItemCard.tsx',
  'src/components/UpsellDrawer.tsx',
  'src/components/PromoBanner.tsx'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Add import if not present
  if (!content.includes('import { formatCurrency }') && content.includes('£')) {
    // find last import or top of file
    const importRegex = /import .* from .*;/g;
    let match;
    let lastImportIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    const importStmt = `\nimport { formatCurrency } from '@/utils/formatters';`;
    if (lastImportIndex > 0) {
      content = content.slice(0, lastImportIndex) + importStmt + content.slice(lastImportIndex);
    } else {
      content = importStmt + '\n' + content;
    }
  }

  // 4. -£{x.toFixed(2)} -> -{formatCurrency(x)}
  content = content.replace(/-£{([^}]+)\.toFixed\(\d\)}/g, '-{formatCurrency($1)}');
  content = content.replace(/-£\${([^}]+)\.toFixed\(\d\)}/g, '-${formatCurrency($1)}');

  // 5. + £{x.toFixed(2)} -> + {formatCurrency(x)}
  content = content.replace(/\+ £{([^}]+)\.toFixed\(\d\)}/g, '+ {formatCurrency($1)}');
  
  // 2. £{x.toFixed(2)} -> {formatCurrency(x)}
  content = content.replace(/£{([^}]+)\.toFixed\(\d\)}/g, '{formatCurrency($1)}');
  
  // 3. £${x.toFixed(2)} -> ${formatCurrency(x)}
  content = content.replace(/£\${([^}]+)\.toFixed\(\d\)}/g, '${formatCurrency($1)}');

  // Fix `-£{promoDiscount.toFixed(2)}` -> `-{formatCurrency(promoDiscount)}`
  // Actually, wait, `{'-'}{formatCurrency(x)}` might be better for JSX text nodes.
  // Let's refine:
  // >-£{...} -> >-{formatCurrency(...)}

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

componentsToFix.forEach(fixFile);
