const fs = require('fs');
const path = require('path');

const componentsToFix = [
  'src/components/DishCTA.tsx',
  'src/components/MenuItemCard.tsx',
  'src/components/SquarePaymentForm.tsx',
  'src/components/menu/SizePickerModal.tsx',
  'src/components/CartDrawer.tsx'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  if (!content.includes('import { formatCurrency }') && content.includes('£')) {
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

  // 1. `£${x.toFixed(2)}` -> `${formatCurrency(x)}`
  content = content.replace(/£\${([^}]+)\.toFixed\(\d\)}/g, '${formatCurrency($1)}');
  // 2. `£{x.toFixed(2)}` -> `{formatCurrency(x)}`
  content = content.replace(/£{([^}]+)\.toFixed\(\d\)}/g, '{formatCurrency($1)}');
  // 3. `£${x?.toFixed(2) || '0.00'}` -> `${formatCurrency(x || 0)}`
  content = content.replace(/£\${([^}]+)\?\.toFixed\(\d\) \|\| '0\.00'}/g, '${formatCurrency($1 || 0)}');

  // Hardcoded text like £2.99
  // Wait, I should not blindly replace £2.99 with formatCurrency(2.99) unless it's easy.
  // We can just leave strings like '£2.99' or '£15' as they are, but the prompt says:
  // "Replace all hardcoded £ in TOV components... 30 occurrences... £{something.toFixed(2)}"
  // It specifically mentions `£{...toFixed(2)}` and `£${something.toFixed(2)}` etc.
  // Let's run this script first.
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

componentsToFix.forEach(fixFile);
